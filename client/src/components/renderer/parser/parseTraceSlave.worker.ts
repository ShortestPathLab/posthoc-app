// import "nested-worker/worker";
import { usingMessageHandler } from "../../../workers/usingWorker";
import { ParseTraceWorkerParameters, parse } from "./ParseTraceSlaveWorker";

onmessage = usingMessageHandler(
  async ({ data }: MessageEvent<ParseTraceWorkerParameters>) => parse(data)
);
