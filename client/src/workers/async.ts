import { memoize as memo } from "lodash";
import {
  CompressWorker,
  CompressBinaryWorker,
  DecompressBinaryWorker,
  HashWorker,
  ParseYamlWorker,
} from ".";
import { usingWorkerTask } from "./usingWorker";

export const hashAsync = memo(usingWorkerTask<string, string>(HashWorker));

export const compressAsync = memo(
  usingWorkerTask<string, string>(CompressWorker)
);
export const compressBinaryAsync = memo(
  usingWorkerTask<string, Uint8Array>(CompressBinaryWorker)
);
export const decompressBinaryAsync = memo(
  usingWorkerTask<Uint8Array, string>(DecompressBinaryWorker)
);

export const parseYamlAsync = memo(
  usingWorkerTask<string, unknown>(ParseYamlWorker)
);
