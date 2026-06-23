import { ComponentEntry } from "renderer";
import { createFrameGenerator, ParseTraceWorkerParameters } from "./ParseTraceSlaveWorker";

/**
 * One streamed frame: the raw, per-event components for a single step. The
 * `event` is intentionally omitted — the orchestrator already holds the events
 * array and looks it up by `index`, so we avoid cloning it back across the
 * worker boundary. Persistence groups are partial (only the groups an event
 * actually produces are present).
 */
export type StreamBatchFrame = {
  index: number;
  components: Partial<{
    persistent: ComponentEntry[];
    transient: ComponentEntry[];
    special: ComponentEntry[];
  }>;
};

export type OnBatch = (frames: StreamBatchFrame[]) => unknown;

const { min } = Math;

// How much work to do before flushing a batch + yielding. Time-budgeted so the
// cadence is steady regardless of how heavy individual events are; also capped
// by count so a single batch can't grow unbounded (which would jank the main
// thread on structured-clone receipt).
const BUDGET_MS = 12;
const MAX_BATCH = 512;

// Module-level state is per worker *instance* (each ComlinkWorker spawns a
// fresh module), so these are this worker's own view of the world.
let currentStep = 0;
let epoch = 0;

/** Smallest index >= `from` owned by `owner` under strided ownership mod `n`. */
const nextOwned = (from: number, owner: number, n: number) => {
  const r = (((owner - from) % n) + n) % n;
  return from + r;
};

/** Pushed live from the UI thread as the user scrubs. */
export function setStep(step: number) {
  currentStep = step;
}

/** Invalidate any in-flight `generate` loop (trace changed / teardown). */
export function cancel() {
  epoch++;
}

/**
 * Generate every frame this worker owns (indices ≡ `owner` mod `n`), forever
 * eager, emitting batches via `onBatch`. Ordering:
 *
 *  1. Island priority: if the user's neighbourhood `[step, step + margin]` has
 *     any owned, ungenerated frame, do that first — so a jump-ahead shows a
 *     (partial) preview quickly.
 *  2. Otherwise advance the contiguous frontier from 0. This is what makes the
 *     prefix fill in, which is what persistent/merged-transient output needs to
 *     become fully correct.
 *
 * `onBatch` is awaited for backpressure: the worker can't outrun the main
 * thread and flood the channel, and the await is also where pushed `setStep` /
 * `cancel` messages get drained.
 */
export async function generate(
  params: ParseTraceWorkerParameters,
  owner: number,
  n: number,
  margin: number,
  onBatch: OnBatch,
  initialStep = 0,
) {
  const myEpoch = ++epoch;
  currentStep = initialStep;

  const total = params.trace?.events?.length ?? 0;
  const gen = createFrameGenerator(params);
  const done = new Uint8Array(total);
  let cursor = nextOwned(0, owner, n); // monotonic contiguous frontier (mine)

  const findNext = (): number => {
    // 1. island around the playhead
    const islandEnd = min(currentStep + margin, total - 1);
    for (let i = nextOwned(currentStep, owner, n); i <= islandEnd; i += n) {
      if (!done[i]) return i;
    }
    // 2. contiguous fill
    while (cursor < total && done[cursor]) cursor += n;
    return cursor < total ? cursor : -1;
  };

  while (myEpoch === epoch) {
    let next = findNext();
    if (next === -1) break; // all my frames done

    const batch: StreamBatchFrame[] = [];
    const start = performance.now();
    while (next !== -1 && batch.length < MAX_BATCH && performance.now() - start < BUDGET_MS) {
      done[next] = 1;
      batch.push({ index: next, components: gen(next).components });
      next = findNext();
    }
    // Awaiting the proxied callback both applies backpressure and lets the
    // worker's event loop process pending setStep/cancel messages.
    await onBatch(batch);
  }
}
