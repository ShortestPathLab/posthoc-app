import { chain, findLast, map } from "lodash";
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
    map(parsed, (p) =>
      mapProperties<
        ParsedComponent<string, any>,
        CompiledComponent<string, Record<string, any>>
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
