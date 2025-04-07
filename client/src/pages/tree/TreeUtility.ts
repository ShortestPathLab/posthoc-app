import { useQuery } from "@tanstack/react-query";
import { treeToDict } from "hooks/useBreakPoints";
import {
  entries,
  every,
  flatMap,
  groupBy,
  head,
  isInteger,
  isPlainObject,
  mapValues,
  uniqBy,
} from "lodash-es";
import { Trace } from "protocol/Trace";
import { _ } from "utils/chain";
import { usingMemoizedWorkerTask } from "workers/usingWorker";
import {
  TreeWorkerParameters,
  TreeWorkerReturnType,
} from "./treeUtility.worker";
import treeWorkerUrl from "./treeUtility.worker.ts?worker&url";
export class TreeWorker extends Worker {
  constructor() {
    super(treeWorkerUrl, { type: "module" });
  }
}

export const treeAsync = usingMemoizedWorkerTask<
  TreeWorkerParameters,
  TreeWorkerReturnType
>(TreeWorker);

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
        return flatMap(entries(t!), ([k, v]) =>
          computeLabelsOne(v, `${root}.${k}`)
        );
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
          return v.length > unique.length * 2
            ? ("text/categorical" as const)
            : ("text" as const);
        case "number":
          return every(v, (c) => isInteger(c.value))
            ? ("number/discrete" as const)
            : ("number/continuous" as const);
      }
    }
    return "mixed" as const;
  }

  return _(
    labels ?? [],
    (t) => t.flatMap((v) => computeLabelsOne(v)),
    (t) => groupBy(t, "path"),
    (t) => mapValues(t, (v) => ({ type: resolveType(v) }))
  );
}

export function useComputeLabels({
  key,
  trace,
}: {
  key?: string;
  trace?: Trace;
}) {
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
