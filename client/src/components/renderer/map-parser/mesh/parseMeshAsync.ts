import {
  ParseMeshWorkerParameters,
  ParseMeshWorkerReturnType,
} from "./parseMesh.worker";
import { usingMemoizedWorkerTask } from "workers/usingWorker";

export const ParseMeshWorker = () =>
  new Worker("./parseMesh.worker.ts", { type: "module" });

export const parseMeshAsync = usingMemoizedWorkerTask<
  ParseMeshWorkerParameters,
  ParseMeshWorkerReturnType
>(ParseMeshWorker);
