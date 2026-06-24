import { useQuery } from "@tanstack/react-query";
import { treeToDict } from "hooks/useBreakPoints";
import { uniq } from "es-toolkit";
import {
  every,
  filter,
  flatMap,
  groupBy,
  head,
  isInteger,
  isPlainObject,
  map,
  mapValues,
  toPairs as entries,
  uniqBy,
} from "es-toolkit/compat";
import { Trace } from "protocol/Trace";
import { flow } from "utils/flow";
import memoizee from "memoizee";
import { endpointSymbol } from "vite-plugin-comlink/symbol";
import { withWorker } from "workers/workerLanes";
import { TreeWorkerParameters, TreeWorkerReturnType } from "./treeUtility.worker";
import { TraceEvent } from "protocol/Trace-v140";

type WorkerModule = typeof import("./treeUtility.worker");

// vite-plugin-comlink rewrites `new ComlinkWorker(...)` into a statement ending
// in `;`, so it MUST sit on its own line (not inside an arrow/expression).
function spawnWorker() {
  const worker = new ComlinkWorker<WorkerModule>(
    new URL("./treeUtility.worker.ts", import.meta.url),
  );
  return worker;
}

const terminate = (w: ReturnType<typeof spawnWorker>) => w[endpointSymbol].terminate();

export const treeAsync = memoizee(
  (params: TreeWorkerParameters): Promise<TreeWorkerReturnType> =>
    withWorker(
      "tree",
      spawnWorker,
      terminate,
      (w) => w.parse(params) as Promise<TreeWorkerReturnType>,
    ),
  { async: true, length: 1 },
);

type X = "text" | "number" | "boolean" | "mixed";

type Y = {
  path: string;
  type: X;
  value: unknown;
};

function computeLabelsOne(t: unknown, root: string = ""): Y[] {
  switch (typeof t) {
    case "symbol":
    case "string":
      return [{ path: root, type: "text", value: t }];
    case "bigint":
    case "number":
      return [{ path: root, type: "number", value: t }];
    case "boolean":
      return [{ path: root, type: "boolean", value: t }];
    case "undefined":
      return [];
    case "function":
      throw Error("Non-serialisable function");
    case "object":
      if (isPlainObject(t))
        return flatMap(entries(t!), ([k, v]) => computeLabelsOne(v, `${root}.${k}`));
  }
  return [{ path: root, type: "mixed", value: undefined }];
}

function computeLabels(labels?: unknown[]) {
  function resolveType(v: Y[]) {
    const unique = uniqBy(v, "type");
    if (unique.length === 1) {
      const { type } = head(unique)!;
      switch (type) {
        case "text":
          // Infer categorical if more than 50% of labels are reused
          return v.length > unique.length * 2 ? ("text/categorical" as const) : ("text" as const);
        case "number":
          return every(v, (c) => isInteger(c.value))
            ? ("number/discrete" as const)
            : ("number/continuous" as const);
      }
    }
    return "mixed" as const;
  }

  return flow(
    labels ?? [],
    (t) => t.flatMap((v) => computeLabelsOne(v)),
    (t) => groupBy(t, "path"),
    (t) => mapValues(t, (v) => ({ type: resolveType(v) })),
  );
}

export function computeTypes(events?: TraceEvent[]) {
  return flow(
    events,
    (s) => map(s, (a, b) => [a, b] as const),
    (s) => map(s, ([e]) => e?.type ?? ""),
    (s) => filter(s),
    uniq,
  );
}

export function useComputeTypes({ key, trace }: { key?: string; trace?: Trace }) {
  return useQuery({
    queryKey: ["compute/types", key],
    queryFn: async () => computeTypes(trace?.events),
    enabled: !!key,
    staleTime: Infinity,
  });
}

export function useComputeLabels({ key, trace }: { key?: string; trace?: Trace }) {
  return useQuery({
    queryKey: ["compute/labels", key],
    queryFn: async () => computeLabels(trace?.events),
    enabled: !!key,
    staleTime: Infinity,
  });
}

export function useComputeTree({
  key,
  radius,
  step,
  trace,
}: TreeWorkerParameters & { key?: string }) {
  return useQuery({
    queryKey: ["compute/tree/utility", key, radius, step],
    queryFn: async () => {
      const tree = await treeAsync({ radius, step, trace });
      if (tree) {
        const dict = treeToDict(tree?.tree ?? []);

        return { dict, ...tree };
      }
    },
    enabled: !!key,
    staleTime: Infinity,
  });
}
