import {
  Dictionary,
  ceil,
  filter,
  flatten,
  get,
  map,
  range,
  values,
} from "lodash";
import { CompiledComponent } from "protocol";
import { ComponentEntry } from "renderer";
import { usingWorkerTask } from "../../../workers/usingWorker";
import {
  ParseTraceWorkerParameters,
  ParseTraceWorkerReturnType,
  ParseTraceWorkerSlaveReturnType,
} from "./parseTraceSlave.worker";
import parseTraceWorkerUrl from "./parseTraceSlave.worker.ts?worker&url";

type C = CompiledComponent<string, Record<string, any>>;

const makeKey = (id: string | number = "", condition: string | number = "") =>
  `${id}::::${condition}`;

const getPersistence = (c: C) =>
  !c.clear
    ? "persistent"
    : typeof c.clear === "string"
    ? "special"
    : "transient";

const isVisible = ({ component: c }: ComponentEntry) =>
  c && Object.hasOwn(c, "alpha") ? get(c, "alpha")! > 0 : true;

type Persistence = ReturnType<typeof getPersistence>;

const { min } = Math;

const SLAVE_COUNT = navigator.hardwareConcurrency ?? 8;

export class ParseTraceWorker extends Worker {
  constructor() {
    super(parseTraceWorkerUrl, { type: "module" });
  }
}

const parseTraceWorker = usingWorkerTask<
  ParseTraceWorkerParameters,
  ParseTraceWorkerSlaveReturnType
>(ParseTraceWorker);

async function parse({
  trace,
  context,
  view = "main",
}: ParseTraceWorkerParameters): Promise<ParseTraceWorkerReturnType> {
  const chunkSize = ceil((trace?.events?.length ?? 0) / SLAVE_COUNT);
  const chunks = range(0, trace?.events?.length, chunkSize);
  const outs = flatten(
    await Promise.all(
      map(chunks, (i) =>
        parseTraceWorker({
          trace,
          context,
          view,
          from: i,
          to: min(i + chunkSize, trace?.events?.length ?? 0),
        })
      )
    )
  );

  const stack: Dictionary<ComponentEntry[]> = {};

  const out: {
    [K in Exclude<Persistence, "special">]: ComponentEntry[];
  }[] = [];
  for (const {
    event,
    components: { transient = [], special = [], persistent = [] },
  } of outs) {
    delete stack[makeKey(event.id, event.type)];
    transient.push(...values(stack).flat());
    for (const a of special) {
      const key = makeKey(event.id, get(a.component, "clear"));
      stack[key] = stack[key] ?? [];
      stack[key].push(a);
      transient.push(a);
    }
    out.push({ transient, persistent });
  }

  console.log(JSON.stringify(out));

  return {
    stepsPersistent: map(out, "persistent").map((c) => filter(c, isVisible)),
    stepsTransient: map(out, "transient").map((c) => filter(c, isVisible)),
  };
}

onmessage = async ({ data }: MessageEvent<ParseTraceWorkerParameters>) => {
  postMessage(await parse(data));
};
