import { chunk, flatMap, map } from "lodash";
import { usingWorkerTask } from "workers/usingWorker";
import {
  ParseTraceWorkerParameters,
  ParseTraceWorkerReturnType,
} from "./parseTraceSlave.worker";
import parseTraceWorkerUrl from "./parseTraceSlave.worker.ts?worker&url";

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
  const chunks = chunk(trace?.events, (trace?.events?.length ?? 0) / 8);

  const outs = await Promise.all(
    map(chunks, (chunk1) =>
      parseTraceWorker({
        trace: { ...trace, events: chunk1 },
        context,
        view,
      })
    )
  );

  return {
    stepsPersistent: flatMap(outs, "stepsPersistent"),
    stepsTransient: flatMap(outs, "stepsTransient"),
  };
}

onmessage = async ({ data }: MessageEvent<ParseTraceWorkerParameters>) => {
  postMessage(await parse(data));
};
