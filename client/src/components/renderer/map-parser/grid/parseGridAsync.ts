import { usingMemoizedWorkerTask } from "workers/usingWorker";
import {
  ParseGridWorkerParameters,
  ParseGridWorkerReturnType,
} from "./parseGrid.worker";
import parseGridWorkerUrl from "./parseGrid.worker.ts?worker&url";

export class ParseGridWorker extends Worker {
  constructor() {
    super(parseGridWorkerUrl, { type: "module" });
  }
}

export const parseGridAsync = usingMemoizedWorkerTask<
  ParseGridWorkerParameters,
  ParseGridWorkerReturnType
>(ParseGridWorker);
