import { queryOptions, useQuery } from "@tanstack/react-query";
import { useSnackbar } from "components/generic/Snackbar";
import { get } from "es-toolkit/compat";
import pluralize from "pluralize";
import { useEffect } from "react";
import { loading } from "slices/loading";
import { endpointSymbol } from "vite-plugin-comlink/symbol";
import { withWorker } from "workers/workerLanes";
import { ParseTraceWorkerParameters as ParseTraceWorkerLegacyParameters } from "../parser/ParseTraceSlaveWorker";
import { ParseTraceWorkerParameters, ParseTraceWorkerReturnType } from "./ParseTraceSlaveWorker";

type AnyTrace =
  | ParseTraceWorkerParameters["trace"]
  | ParseTraceWorkerLegacyParameters["trace"];

type WorkerModule = typeof import("./parseTrace.worker");
type LegacyWorkerModule = typeof import("../parser/parseTrace.worker");

// vite-plugin-comlink rewrites `new ComlinkWorker(...)` into a statement ending
// in `;`, so each MUST sit on its own line (not inside an arrow/expression).
function spawnWorker() {
  const worker = new ComlinkWorker<WorkerModule>(
    new URL("./parseTrace.worker.ts", import.meta.url),
  );
  return worker;
}

function spawnLegacyWorker() {
  const worker = new ComlinkWorker<LegacyWorkerModule>(
    new URL("../parser/parseTrace.worker.ts", import.meta.url),
  );
  return worker;
}

const terminate = (w: { [endpointSymbol]: Worker }) => w[endpointSymbol].terminate();

const EMPTY_COMPONENTS: ParseTraceWorkerReturnType = {
  stepsPersistent: [],
  stepsTransient: [],
};

export type ParsedTrace =
  | { components: ParseTraceWorkerReturnType; content: AnyTrace }
  | { error?: string }
  | undefined;

export type ParsedTraceOptions = {
  /** Lightweight cache identity for the trace (its key). */
  key?: string;
  trace?: AnyTrace;
  context: ParseTraceWorkerParameters["context"];
  view?: string;
  /** Untrusted traces skip component generation (empty preview). */
  trusted: boolean;
  /** Identity for the (palette-derived) render context, so re-theming re-parses. */
  contextKey?: string;
  enabled?: boolean;
  notify?: (title: string, subtitle?: string) => void;
};

/**
 * One-shot trace parse for the legacy / untrusted path. The expensive worker
 * generation is keyed by the lightweight `key` + render-context identity rather
 * than the whole trace, and runs through the `trace-gen` lane with React Query's
 * `signal` for cancellation. (v1.4.0 trusted traces stream instead — see
 * `useTraceStream`.)
 */
export const parsedTraceQuery = ({
  key,
  trace,
  context,
  view = "main",
  trusted,
  contextKey,
  enabled = true,
  notify,
}: ParsedTraceOptions) =>
  queryOptions({
    queryKey: ["parse-trace", key, view, trusted, contextKey],
    queryFn: async ({ signal }): Promise<ParsedTrace> => {
      if (!trace) return undefined;
      if (!trusted) {
        notify?.("Trace loaded", pluralize("step", trace?.events?.length ?? 0, true));
        return { content: trace, components: EMPTY_COMPONENTS };
      }
      notify?.("Processing trace...");
      try {
        const params = { trace, context, view };
        const output =
          trace?.version === "1.4.0"
            ? await withWorker(
                "trace-gen",
                spawnWorker,
                terminate,
                (w) => w.parseTrace(params as ParseTraceWorkerParameters),
                { signal },
              )
            : await withWorker(
                "trace-gen",
                spawnLegacyWorker,
                terminate,
                (w) => w.parseTrace(params as ParseTraceWorkerLegacyParameters),
                { signal },
              );
        notify?.("Trace loaded", pluralize("step", output?.stepsPersistent?.length ?? 0, true));
        return { components: output, content: trace };
      } catch (e) {
        console.error(e);
        notify?.("Error parsing", get(e, "message"));
        return { error: get(e, "message") };
      }
    },
    enabled: enabled && !!trace && !!key,
    staleTime: Infinity,
  });

/**
 * Hook wrapper around {@link parsedTraceQuery} that wires the snackbar lifecycle
 * and mirrors the query's in-flight state into the global "layers" loading
 * counter. Returns the React Query result; the caller writes the data to its
 * layer.
 */
export function useTraceParser(options: Omit<ParsedTraceOptions, "notify">) {
  const notify = useSnackbar();
  const query = useQuery(parsedTraceQuery({ ...options, notify }));
  const { isFetching } = query;
  useEffect(() => {
    if (!isFetching) return;
    loading.start("layers");
    return () => loading.end("layers");
  }, [isFetching]);
  return query;
}
