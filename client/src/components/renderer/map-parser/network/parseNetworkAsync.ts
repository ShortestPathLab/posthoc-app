import {
  ParseNetworkWorkerParameters,
  ParseNetworkWorkerReturnType,
} from "./parseNetwork.worker";
import { usingMemoizedWorkerTask } from "workers/usingWorker";

export const ParseNetworkWorker = () =>
  new Worker("./parseNetwork.worker.ts", { type: "module" });

export const parseNetworkAsync = usingMemoizedWorkerTask<
  ParseNetworkWorkerParameters,
  ParseNetworkWorkerReturnType
>(ParseNetworkWorker);
