import { chain, find, findLast, forEach, last, map } from "lodash";
import {
  CompiledComponent,
  EventContext,
  ParsedComponent,
  Trace,
  TraceEvent,
} from "protocol";
import { ComponentEntry } from "renderer";
import { mapProperties } from "./mapProperties";
import { parse as parseComponents } from "./parse";

const isNullish = (x: KeyRef): x is Exclude<KeyRef, Key> =>
  x === undefined || x === null;

type Key = string | number;

type KeyRef = Key | null | undefined;

function makePathIndex({ trace }: Pick<ParseTraceWorkerParameters, "trace">) {
  type A = {
    id: Key;
    pId: KeyRef;
    step: number;
    prev?: A;
  };

  const cache: A[] = [];
  const dict: { [K in Key]: KeyRef } = {};
  forEach(trace?.events, ({ id, pId }, i) => {
    if (!isNullish(pId) && dict[id] !== pId) {
      cache.push({ id, pId, step: i, prev: last(cache) });
      dict[id] = pId;
    }
  });
  return {
    getParent: (id: Key, step: number = trace?.events?.length ?? 0) => {
      let entry = findLast(cache, (c) => c.step <= step);
      while (entry) {
        if (entry.id === id) return entry.pId;
        entry = entry.prev;
      }
    },
  };
}

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
  ): CompiledComponent<string, {}>[] =>
    map(parsed, (p) =>
      mapProperties<
        ParsedComponent<string, any>,
        CompiledComponent<string, {}>
      >(p, (c) =>
        c({
          alpha: 1,
          ...context,
          ...ctx,
          ...event,
        })
      )
    );

  const isVisible = (c: CompiledComponent<string, { alpha?: number }>) =>
    c && c.hasOwnProperty("alpha") ? c!.alpha! > 0 : true;

  const makeEntryIteratee =
    (step: number) => (component: CompiledComponent<string, {}>) => ({
      component,
      meta: { source: "trace", step: step },
    });

  const r = chain(trace?.events)
    .map((c, i) => ({ step: i, id: c.id, data: c, pId: c.pId }))
    .groupBy("id")
    .value();

  const steps = chain(trace?.events)
    .map((e, i, esx) =>
      apply(e, {
        ...context,
        step: i,
        parent: !isNullish(e.pId)
          ? esx[findLast(r[e.pId], (x) => x.step <= i)?.step ?? 0]
          : undefined,
      })
    )
    .map((c) => c.filter(isVisible))
    .map((c, i) => c.map(makeEntryIteratee(i)))
    .value();

  return {
    steps,
  };
}

export type ParseTraceWorkerParameters = {
  trace?: Trace;
  context: EventContext;
  view?: string;
};

export type ParseTraceWorkerReturnType = {
  steps: ComponentEntry[][];
};

onmessage = ({ data }: MessageEvent<ParseTraceWorkerParameters>) => {
  postMessage(parse(data));
};
