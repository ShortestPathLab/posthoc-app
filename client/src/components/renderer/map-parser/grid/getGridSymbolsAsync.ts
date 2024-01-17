import { usingWorkerTask } from "workers/usingWorker";
import {
  GetGridSymbolsParameters,
  GetGridSymbolsReturnType,
} from "./getGridSymbols.worker";
import getGridSymbolsUrl from "./getGridSymbols.worker.ts?worker&url";

export class GetGridSymbolsWorker extends Worker {
  constructor() {
    super(getGridSymbolsUrl, { type: "module" });
  }
}

export const getGridSymbolsAsync = usingWorkerTask<
  GetGridSymbolsParameters,
  GetGridSymbolsReturnType
>(GetGridSymbolsWorker);
