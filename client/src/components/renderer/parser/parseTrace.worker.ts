import { Dictionary, chain, find, findLast, forEach, map, sumBy } from "lodash";
import { arrayToTree } from "performant-array-to-tree";
import {
  CompiledComponent,
  EventContext,
  ParsedComponent,
  Trace,
  TraceEvent,
} from "protocol";
import { mapProperties } from "./mapProperties";
import { parse as parseComponents } from "./parse";
import { ComponentEntry } from "renderer";

type Key = string | number | null | undefined;

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
        parent:
          e.pId !== null && e.pId !== undefined
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
