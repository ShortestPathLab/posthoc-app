import { memoize as memo } from "lodash";
import { CompressWorker, HashWorker } from ".";
import { usingWorkerTask } from "./usingWorker";

export const hashAsync = memo(usingWorkerTask<string, string>(HashWorker));

export const compressAsync = memo(
  usingWorkerTask<string, string>(CompressWorker)
);