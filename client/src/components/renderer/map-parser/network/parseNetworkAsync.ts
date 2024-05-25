import {
  ParseNetworkWorkerParameters,
  ParseNetworkWorkerReturnType,
} from "./parseNetwork.worker";
import { usingMemoizedWorkerTask } from "workers/usingWorker";
import parseNetworkWorkerUrl from "./parseNetwork.worker.ts?worker&url";

export class ParseNetworkWorker extends Worker {
  constructor() {
    super(parseNetworkWorkerUrl, { type: "module" });
  }
}

export const parseNetworkAsync = usingMemoizedWorkerTask<
  ParseNetworkWorkerParameters,
  ParseNetworkWorkerReturnType
>(ParseNetworkWorker);
