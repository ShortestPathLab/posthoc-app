import { findLast, groupBy, mapValues, range } from "lodash-es";
import { CompiledComponent, EventContext, TraceEvent } from "protocol";
import { Trace } from "protocol/Trace-v140";
import { ComponentEntry } from "renderer";
import { _ } from "utils/chain";
import { normalizeConstant } from "./normalize";
import { parse as parseComponents } from "./parse";

type C = CompiledComponent<string, Record<string, unknown>>;
const isNullish = (x: KeyRef): x is Exclude<KeyRef, Key> =>
  x === undefined || x === null;
type Key = string | number;
type KeyRef = Key | null | undefined;
const getPersistence = (c: C) =>
  !c.clear
    ? "persistent"
    : typeof c.clear === "string"
      ? "special"
      : "transient";
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
export function parse({
  trace,
  context,
  view = "main",
  from = 0,
  to = trace?.events?.length ?? 0,
}: ParseTraceWorkerParameters): ParseTraceWorkerSlaveReturnType {
  const parsed = parseComponents(
    trace?.views?.[view] ?? [],
    trace?.views ?? {}
  );

  const makeEntryIteratee = (step: number) => (component: C) => {
    return {
      component,
      meta: { source: "trace", step: from + step, info: component.$info },
    };
  };

  const r = _(
    trace?.events ?? [],
    (r) => r.map((c, i) => ({ step: i, id: c.id, data: c, pId: c.pId })),
    (r) => groupBy(r, "id")
  );

  return range(from, to)
    .map((i) => {
      const e = trace!.events![i]!;
      const esx = trace!.events!;
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
                  ? esx[findLast(r[e.pId], (x) => x.step <= i)?.step ?? 0]
                  : undefined,
                events: esx,
                event: e,
              },
            },
            e
          )
        )
      );
      return {
        event: e,
        components: groupBy(component, getPersistence) as {
          [K in Persistence]: C[];
        },
      };
    })
    .map((c, i) => ({
      event: c.event,
      components: mapValues(c.components, (c2) => c2.map(makeEntryIteratee(i))),
    }));
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
