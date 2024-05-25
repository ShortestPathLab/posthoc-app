import {
  ParsePolyWorkerParameters,
  ParsePolyWorkerReturnType,
} from "./parsePoly.worker";
import { usingMemoizedWorkerTask } from "workers/usingWorker";
import parsePolyWorkerUrl from "./parsePoly.worker.ts?worker&url";

export class ParsePolyWorker extends Worker {
  constructor() {
    super(parsePolyWorkerUrl, { type: "module" });
  }
}

export const parsePolyAsync = usingMemoizedWorkerTask<
  ParsePolyWorkerParameters,
  ParsePolyWorkerReturnType
>(ParsePolyWorker);
