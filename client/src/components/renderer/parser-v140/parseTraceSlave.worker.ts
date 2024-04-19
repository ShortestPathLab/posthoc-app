import { chain, findLast, map, mapValues, negate, range } from "lodash";
import { CompiledComponent, EventContext } from "protocol";
import { Trace } from "protocol/Trace-v130";
import { ComponentEntry } from "renderer";
import { normalizeConstant } from "./normalize";
import { parse as parseComponents } from "./parse";

const isNullish = (x: KeyRef): x is Exclude<KeyRef, Key> =>
  x === undefined || x === null;

type Key = string | number;

type KeyRef = Key | null | undefined;

const isPersistent = (c: CompiledComponent<string, Record<string, any>>) =>
  !c.clear;

function mergePrototype<T>(target: T, source: any) {
  Object.setPrototypeOf(target, source);
  return target;
}

function parse({
  trace,
  context,
  view = "main",
  from = 0,
  to = trace?.events?.length ?? 0,
}: ParseTraceWorkerParameters): ParseTraceWorkerReturnType {
  const parsed = parseComponents(
    trace?.views?.[view] ?? [],
    trace?.views ?? {}
  );

  const isVisible = (c: CompiledComponent<string, { alpha?: number }>) =>
    c && Object.hasOwn(c, "alpha") ? c!.alpha! > 0 : true;

  const makeEntryIteratee =
    (step: number) =>
    (component: CompiledComponent<string, Record<string, any>>) => {
      return {
        component,
        meta: { source: "trace", step: from + step, info: component.$info },
      };
    };

  const r = chain(trace?.events)
    .map((c, i) => ({ step: i, id: c.id, data: c, pId: c.pId }))
    .groupBy("id")
    .value();

  const steps = chain(range(from, to))
    .map((i) => {
      const e = trace!.events![i]!;
      const esx = trace!.events!;
      const component = parsed(
        normalizeConstant(
          mergePrototype(
            {
              alpha: 1,
              ...context,
              step: i,
              parent: !isNullish(e.pId)
                ? esx[findLast(r[e.pId], (x) => x.step <= i)?.step ?? 0]
                : undefined,
              events: esx,
            },
            e
          )
        )
      );
      const persistent = component.filter(isPersistent);
      const transient = component.filter(negate(isPersistent));
      return { persistent, transient };
    })
    .map((c) => mapValues(c, (b) => b.filter(isVisible)))
    .map((c, i) => mapValues(c, (b) => b.map(makeEntryIteratee(i))))
    .value();
  return {
    stepsPersistent: map(steps, (c) => c.persistent),
    stepsTransient: map(steps, (c) => c.transient),
  };
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

onmessage = ({ data }: MessageEvent<ParseTraceWorkerParameters>) => {
  postMessage(parse(data));
};
