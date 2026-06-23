import { clamp, floor } from "es-toolkit/compat";
import { nanoid } from "nanoid";
import { EventContext } from "protocol";
import { Trace } from "protocol/Trace-v140";
import { useEffect, useRef } from "react";
import { slice } from "slices";
import { useOne } from "slices/useOne";
import { set } from "utils/set";
import {
  createTraceStream,
  StreamBatchFrame,
  TraceStream,
} from "components/renderer/parser-v140/streamParseTrace";
import {
  advanceMerge,
  createStreamBuffers,
  disposeStreamBuffers,
  visible,
} from "./traceStreamStore";

// Minimum spacing between store commits. We own this floor (rather than relying
// on requestIdleCallback's `timeout`, which the polyfill ignores) so the commit
// cadence — and therefore the re-render rate — is bounded on every platform.
const COMMIT_FLOOR_MS = 1000;

const { max } = Math;

type ProduceFn = (f: (l: any) => void) => void;

const autoWorkerCount = () => clamp(floor(navigator.hardwareConcurrency / 4), 1, 12);

/**
 * Streams a v1.4.0 trace's render components into an external buffer store
 * (see `traceStreamStore`) while publishing a lightweight `stream` handle on the
 * layer for the renderer/steps page to react to. No-ops unless `enabled`.
 *
 * Lifecycle is keyed on the trace identity + rendering context: a new trace or a
 * theme change tears the workers down and restarts. The frame buffers live
 * outside the immer store and are mutated in place; only `frontier`/`version`/
 * `complete` primitives are committed to the store, throttled to ~`COMMIT_FLOOR_MS`.
 */
export function useTraceStream({
  enabled,
  traceKey,
  content,
  context,
  view = "main",
  step,
  produce,
}: {
  enabled: boolean;
  traceKey?: string;
  content?: Trace;
  context: EventContext;
  view?: string;
  step: number;
  produce: ProduceFn;
}) {
  const settings = useOne(slice.settings);
  const settingCount = settings["performance/workerCount"];
  // The stored default is 1 (and the renderer overrides it the same way); treat
  // <= 1 as "auto" so component generation actually fans out across cores.
  const workerCount = settingCount && settingCount > 1 ? settingCount : autoWorkerCount();

  // `produce` is a fresh closure each render; keep the latest in a ref so the
  // setup effect doesn't have to depend on it (which would restart the stream
  // on every render).
  const produceRef = useRef(produce);
  produceRef.current = produce;

  const streamRef = useRef<TraceStream | undefined>(undefined);

  // Restart when the trace changes or the rendering context (colours) changes.
  const contextKey = JSON.stringify(context ?? {});

  useEffect(() => {
    if (!enabled || !content?.events) return;

    const total = content.events.length;
    const events = content.events;
    const streamKey = nanoid();
    const buffers = createStreamBuffers(streamKey, total);

    produceRef.current((l) => {
      set(l, "source.parsedTrace", {
        content,
        stream: { streamKey, total, frontier: 0, version: 0, complete: total === 0 },
      });
      set(l, "viewKey", nanoid());
    });

    const controller = new AbortController();
    const { signal } = controller;
    let dirty = false;
    let floorTimer: ReturnType<typeof setTimeout> | undefined;
    let idleHandle: number | undefined;
    let lastCommit = 0;

    const doCommit = () => {
      idleHandle = undefined;
      if (signal.aborted || !dirty) return;
      dirty = false;
      lastCommit = performance.now();
      advanceMerge(buffers, events);
      const frontier = buffers.mergedTo;
      const complete = frontier >= total;
      produceRef.current((l) => {
        set(l, "source.parsedTrace.stream.frontier", frontier);
        set(l, "source.parsedTrace.stream.complete", complete);
        set(l, "source.parsedTrace.stream.version", (l?.source?.parsedTrace?.stream?.version ?? 0) + 1);
      });
    };

    const scheduleCommit = () => {
      if (signal.aborted || floorTimer !== undefined || idleHandle !== undefined) return;
      const wait = max(0, COMMIT_FLOOR_MS - (performance.now() - lastCommit));
      floorTimer = setTimeout(() => {
        floorTimer = undefined;
        // requestIdleCallback picks an idle moment within the window; the floor
        // above guarantees we never commit more often than COMMIT_FLOOR_MS.
        idleHandle = requestIdleCallback(doCommit, { timeout: COMMIT_FLOOR_MS });
      }, wait);
    };

    const flushNow = () => {
      if (floorTimer !== undefined) {
        clearTimeout(floorTimer);
        floorTimer = undefined;
      }
      if (idleHandle !== undefined) {
        cancelIdleCallback(idleHandle);
        idleHandle = undefined;
      }
      doCommit();
    };

    if (total === 0) {
      return () => {
        controller.abort();
        disposeStreamBuffers(streamKey);
      };
    }

    const onBatch = (frames: StreamBatchFrame[]) => {
      if (signal.aborted) return;
      for (const f of frames) {
        const i = f.index;
        buffers.persistent[i] = visible(f.components.persistent ?? []);
        buffers.transientOwn[i] = f.components.transient ?? [];
        buffers.special[i] = f.components.special ?? [];
        buffers.generated[i] = 1;
      }
      dirty = true;
      scheduleCommit();
    };

    const stream = createTraceStream(
      { trace: content, context, view },
      {
        workerCount,
        initialStep: step,
        signal,
        onBatch,
        onComplete: () => {
          if (signal.aborted) return;
          dirty = true;
          flushNow();
        },
        onError: (e) => {
          if (signal.aborted) return;
          console.error(e);
          produceRef.current((l) =>
            set(l, "source.parsedTrace.error", `${e instanceof Error ? e.message : e}`),
          );
        },
      },
    );
    streamRef.current = stream;

    return () => {
      controller.abort();
      if (floorTimer !== undefined) clearTimeout(floorTimer);
      if (idleHandle !== undefined) cancelIdleCallback(idleHandle);
      streamRef.current = undefined;
      disposeStreamBuffers(streamKey);
    };
    // step is intentionally omitted: it's forwarded via setStep below, not a restart trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, traceKey, contextKey, view, workerCount]);

  // Forward the live playhead so workers prioritise the user's neighbourhood.
  useEffect(() => {
    streamRef.current?.setStep(step);
  }, [step]);
}
