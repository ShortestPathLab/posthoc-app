import { memoize as memo } from "lodash";
import { CompressWorker, HashWorker, ParseYamlWorker } from ".";
import { usingWorkerTask } from "./usingWorker";

export const hashAsync = memo(usingWorkerTask<string, string>(HashWorker));

export const compressAsync = memo(
  usingWorkerTask<string, string>(CompressWorker)
);

export const parseYamlAsync = memo(
  usingWorkerTask<string, any>(ParseYamlWorker)
);
