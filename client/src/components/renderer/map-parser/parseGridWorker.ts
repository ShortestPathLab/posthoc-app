import { usingWorkerTask } from "workers/usingWorker";
import parseGridWorkerUrl from "./parseGrid.worker.ts?worker&url";
import {
  ParseGridWorkerParameters,
  ParseGridWorkerReturnType,
} from "./parseGrid.worker";

export class ParseGridWorker extends Worker {
  constructor() {
    super(parseGridWorkerUrl, { type: "module" });
  }
}

export const parseGridAsync = usingWorkerTask<
  ParseGridWorkerParameters,
  ParseGridWorkerReturnType
>(ParseGridWorker);
