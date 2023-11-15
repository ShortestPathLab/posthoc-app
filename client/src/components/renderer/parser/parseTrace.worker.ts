import { chunk, flatMap, map, range } from "lodash";
import { usingWorkerTask } from "../../../workers/usingWorker";
import {
  ParseTraceWorkerParameters,
  ParseTraceWorkerReturnType,
} from "./parseTraceSlave.worker";
import parseTraceWorkerUrl from "./parseTraceSlave.worker.ts?worker&url";

const { min } = Math;

const SLAVE_COUNT = navigator.hardwareConcurrency ?? 8;
const CHUNK_SIZE = 16;

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
  const chunks = range(0, trace?.events?.length, CHUNK_SIZE);
  const tasks = chunk(chunks, SLAVE_COUNT);
  const outs = [];

  for (const task of tasks) {
    outs.push(
      ...(await Promise.all(
        map(task, (i) =>
          parseTraceWorker({
            trace,
            context,
            view,
            from: i,
            to: min(i + CHUNK_SIZE, trace?.events?.length ?? 0),
          })
        )
      ))
    );
  }

  return {
    stepsPersistent: flatMap(outs, "stepsPersistent"),
    stepsTransient: flatMap(outs, "stepsTransient"),
  };
}

onmessage = async ({ data }: MessageEvent<ParseTraceWorkerParameters>) => {
  postMessage(await parse(data));
};
