import { endpointSymbol, proxy } from "vite-plugin-comlink/symbol";
import { ParseTraceWorkerParameters } from "./ParseTraceSlaveWorker";
import type { StreamBatchFrame } from "./streamParseTrace.worker";

type WorkerModule = typeof import("./streamParseTrace.worker");

export type { StreamBatchFrame };

export type TraceStream = {
  /** Push the current playhead so workers prioritise that neighbourhood. */
  setStep: (step: number) => void;
  /** Cancel all workers and terminate them. Idempotent. */
  dispose: () => void;
};

export type TraceStreamOptions = {
  workerCount: number;
  /** Frames to eagerly generate ahead of a jumped-to step (keep small). */
  margin?: number;
  initialStep?: number;
  onBatch: (frames: StreamBatchFrame[]) => void;
  /** Called once every worker has finished generating all of its frames. */
  onComplete?: () => void;
  onError?: (error: unknown) => void;
};

const DEFAULT_MARGIN = 64;

const { max, min } = Math;

// vite-plugin-comlink rewrites `new ComlinkWorker(...)` into a statement ending
// in `;`, so it MUST sit on its own line (not inside an arrow/expression) or it
// produces invalid syntax. Hence this standalone factory rather than an inline
// `Array.from(() => new ComlinkWorker(...))`.
function spawnWorker() {
  const worker = new ComlinkWorker<WorkerModule>(
    new URL("./streamParseTrace.worker.ts", import.meta.url),
  );
  return worker;
}

/**
 * Spawns a fleet of long-lived Comlink workers that stream a trace's render
 * components in, strided so worker `owner` owns event indices ≡ `owner` mod N.
 *
 * NOTE (deferred optimisation): each worker receives its own structured-clone
 * of the full trace, so peak input memory is ~N× the trace. Acceptable for now
 * (parsing is cheap and most traces are small); the fix is to share the trace's
 * source bytes via a SharedArrayBuffer and parse per-worker. See memory note
 * `trace-event-streaming-design`.
 */
export function createTraceStream(
  params: ParseTraceWorkerParameters,
  { workerCount, margin = DEFAULT_MARGIN, initialStep = 0, onBatch, onComplete, onError }: TraceStreamOptions,
): TraceStream {
  const total = params.trace?.events?.length ?? 0;
  // No point spawning more workers than there are events.
  const n = max(1, min(workerCount, total || 1));

  const workers: ReturnType<typeof spawnWorker>[] = [];
  for (let i = 0; i < n; i++) workers.push(spawnWorker());

  let disposed = false;

  Promise.all(
    workers.map((w, owner) => w.generate(params, owner, n, margin, proxy(onBatch), initialStep)),
  )
    .then(() => {
      if (!disposed) onComplete?.();
    })
    .catch((e) => {
      if (!disposed) onError?.(e);
    });

  return {
    setStep: (step) => {
      if (disposed) return;
      for (const w of workers) w.setStep(step);
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      for (const w of workers) {
        try {
          w.cancel();
          w[endpointSymbol].terminate();
        } catch (e) {
          console.warn(e);
        }
      }
    },
  };
}
