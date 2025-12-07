import {
  ParsePolyWorkerParameters,
  ParsePolyWorkerReturnType,
} from "./parsePoly.worker";
import { usingMemoizedWorkerTask } from "workers/usingWorker";

export const ParsePolyWorker = () =>
  new Worker("./parsePoly.worker.ts", { type: "module" });

export const parsePolyAsync = usingMemoizedWorkerTask<
  ParsePolyWorkerParameters,
  ParsePolyWorkerReturnType
>(ParsePolyWorker);
