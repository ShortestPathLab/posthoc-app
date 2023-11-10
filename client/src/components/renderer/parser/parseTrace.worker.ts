import { chain, findLast, mapValues, negate } from "lodash";
import {
  CompiledComponent,
  EventContext,
  ParsedComponent,
  Trace,
  TraceEvent,
} from "protocol";
import { ComponentEntry } from "renderer";
import { mapProperties } from "./mapProperties";
import { normalizeConstant } from "./normalize";
import { parse as parseComponents } from "./parse";

const isNullish = (x: KeyRef): x is Exclude<KeyRef, Key> =>
  x === undefined || x === null;

type Key = string | number;

type KeyRef = Key | null | undefined;

const isPersistent = (c: CompiledComponent<string, Record<string, any>>) =>
  c.display !== "transient";

function parse({
  trace,
  context,
  view = "main",
}: ParseTraceWorkerParameters): ParseTraceWorkerReturnType {
  const parsed = parseComponents(
    trace?.render?.views?.[view]?.components ?? [],
    trace?.render?.components ?? {}
  );

  const apply = (
    event: TraceEvent,
    ctx?: EventContext
  ): CompiledComponent<string, Record<string, any>>[] =>
    parsed.map((p) =>
      mapProperties<
        ParsedComponent<string, any>,
        CompiledComponent<string, Record<string, any>>
      >(p, (c) =>
        c(
          normalizeConstant({
            alpha: 1,
            ...context,
            ...ctx,
            event,
            events: trace?.events,
          })
        )
      )
    );

  const isVisible = (c: CompiledComponent<string, { alpha?: number }>) =>
    c && Object.hasOwn(c, "alpha") ? c!.alpha! > 0 : true;

  const makeEntryIteratee =
    (step: number) =>
    (component: CompiledComponent<string, Record<string, any>>) => ({
      component,
      meta: { source: "trace", step: step },
    });

  const r = chain(trace?.events)
    .map((c, i) => ({ step: i, id: c.id, data: c, pId: c.pId }))
    .groupBy("id")
    .value();

  const steps = chain(trace?.events)
    .map((e, i, esx) => {
      const component = apply(e, {
        step: i,
        parent: !isNullish(e.pId)
          ? esx[findLast(r[e.pId], (x) => x.step <= i)?.step ?? 0]
          : undefined,
      });
      const persistent = component.filter(isPersistent);
      const transient = component.filter(negate(isPersistent));
      return { persistent, transient };
    })
    .map((c) => mapValues(c, (b) => b.filter(isVisible)))
    .map((c, i) => mapValues(c, (b) => b.map(makeEntryIteratee(i))))
    .value();
  return {
    stepsPersistent: steps.map((c) => c.persistent),
    stepsTransient: steps.map((c) => c.transient),
  };
}

export type ParseTraceWorkerParameters = {
  trace?: Trace;
  context: EventContext;
  view?: string;
};

export type ParseTraceWorkerReturnType = {
  stepsPersistent: ComponentEntry[][];
  stepsTransient: ComponentEntry[][];
};

onmessage = ({ data }: MessageEvent<ParseTraceWorkerParameters>) => {
  postMessage(parse(data));
};
