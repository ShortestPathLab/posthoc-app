import {
  ParseGridWorkerParameters,
  ParseGridWorkerReturnType,
} from "./parseGrid.worker";
import { usingMemoizedWorkerTask } from "workers/usingWorker";

export const ParseGridWorker = () =>
  new Worker("./parseGrid.worker.ts", { type: "module" });

export const parseGridAsync = usingMemoizedWorkerTask<
  ParseGridWorkerParameters,
  ParseGridWorkerReturnType
>(ParseGridWorker);
