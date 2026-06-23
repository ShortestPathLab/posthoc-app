import { findLast, groupBy, mapValues, range } from "es-toolkit/compat";
import { CompiledComponent, EventContext, TraceEvent } from "protocol";
import { Trace } from "protocol/Trace-v140";
import { ComponentEntry } from "renderer";
import { flow } from "utils/flow";
import { normalizeConstant } from "./normalize";
import { parse as parseComponents } from "./parse";

type C = CompiledComponent<string, Record<string, unknown>>;
const isNullish = (x: KeyRef): x is Exclude<KeyRef, Key> => x === undefined || x === null;
type Key = string | number;
type KeyRef = Key | null | undefined;
const getPersistence = (c: C) =>
  !c.clear ? "persistent" : typeof c.clear === "string" ? "special" : "transient";
type Persistence = ReturnType<typeof getPersistence>;
function mergePrototype<T>(target: T, source: object) {
  Object.setPrototypeOf(target, source);
  return target;
}

export type ParseTraceWorkerSlaveReturnType = {
  event: TraceEvent;
  components: {
    [K in Persistence]: ComponentEntry[];
  };
}[];
const GREY = "#808080";

export type SingleFrame = ParseTraceWorkerSlaveReturnType[number];

/**
 * Builds the per-event component generator for a trace. The expensive global
 * setup (compiling the view's components, indexing events by id) happens once;
 * the returned function generates the components for a single event index and
 * is safe to call in *any* order. That order-independence is what lets
 * generation run strided across workers and jump ahead to the user's current
 * step.
 *
 * Caveat: only the *persistent* output is truly order-independent. The final
 * *transient* output additionally depends on a sequential fold (the "special"
 * stack) performed downstream in `parseTrace.worker.ts` / the streaming merge,
 * so a frame generated out of order is only a partial preview until the
 * contiguous prefix behind it has been merged.
 */
export function createFrameGenerator({
  trace,
  context,
  view = "main",
}: ParseTraceWorkerParameters): (i: number) => SingleFrame {
  const parsed = parseComponents(trace?.views?.[view] ?? [], trace?.views ?? {});
  const events = trace?.events ?? [];
  const byId = flow(
    events,
    (r) => r.map((c, i) => ({ step: i, id: c.id, data: c, pId: c.pId })),
    (r) => groupBy(r, "id"),
  );
  const makeEntryIteratee = (step: number) => (component: C) => ({
    component,
    meta: { source: "trace", step, info: component.$info },
  });
  return (i: number) => {
    const e = events[i]!;
    const component = parsed(
      normalizeConstant(
        mergePrototype(
          {
            alpha: 1,
            fill: GREY,
            __internal__: {
              context,
              step: i,
              parent: !isNullish(e.pId)
                ? events[findLast(byId[e.pId], (x) => x.step <= i)?.step ?? 0]
                : undefined,
              events,
              event: e,
            },
          },
          e,
        ),
      ),
    );
    const entry = makeEntryIteratee(i);
    return {
      event: e,
      components: mapValues(
        groupBy(component, getPersistence) as { [K in Persistence]: C[] },
        (c2) => c2.map(entry),
      ),
    } as SingleFrame;
  };
}

export function parse(params: ParseTraceWorkerParameters): ParseTraceWorkerSlaveReturnType {
  const { trace, from = 0, to = trace?.events?.length ?? 0 } = params;
  const gen = createFrameGenerator(params);
  return range(from, to).map((i) => gen(i));
}

export type ParseTraceWorkerParameters = {
  trace?: Trace;
  context: EventContext;
  view?: string;
  from?: number;
  to?: number;
};

export type ParseTraceWorkerReturnType = {
  stepsPersistent: ComponentEntry[][];
  stepsTransient: ComponentEntry[][];
};
