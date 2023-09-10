import { usingMemoizedWorkerTask } from "workers/usingWorker";
import {
  ParseMeshWorkerParameters,
  ParseMeshWorkerReturnType,
} from "./parseMesh.worker";
import parseMeshWorkerUrl from "./parseMesh.worker.ts?worker&url";

export class ParseMeshWorker extends Worker {
  constructor() {
    super(parseMeshWorkerUrl, { type: "module" });
  }
}

export const parseMeshAsync = usingMemoizedWorkerTask<
  ParseMeshWorkerParameters,
  ParseMeshWorkerReturnType
>(ParseMeshWorker);
