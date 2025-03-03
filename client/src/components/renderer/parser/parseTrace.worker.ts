import { ceil, flatMap, flatten, map, range } from "lodash-es";
import { usingMessageHandler, usingWorkerTask } from "workers/usingWorker";
import {
  ParseTraceWorkerParameters,
  ParseTraceWorkerReturnType,
} from "./ParseTraceSlaveWorker";
import parseTraceWorkerUrl from "./parseTraceSlave.worker.ts?worker&url";

const { min } = Math;

const SLAVE_COUNT = navigator.hardwareConcurrency ?? 8;

export class ParseTraceWorker extends Worker {
  constructor() {
    super(parseTraceWorkerUrl, { type: "module" });
  }
}

const parseTraceWorker = usingWorkerTask<
  ParseTraceWorkerParameters,
  ParseTraceWorkerReturnType
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

  return {
    stepsPersistent: flatMap(outs, "stepsPersistent"),
    stepsTransient: flatMap(outs, "stepsTransient"),
  };
}

onmessage = usingMessageHandler(
  async ({ data }: MessageEvent<ParseTraceWorkerParameters>) =>
    await parse(data)
);
