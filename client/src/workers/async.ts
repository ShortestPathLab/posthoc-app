import { memoize as memo } from "lodash";
import {
  CompressWorker,
  CompressBinaryWorker,
  DecompressBinaryWorker,
  HashWorker,
  ParseYamlWorker,
} from ".";
import { usingWorkerTask } from "./usingWorker";
import { YAMLException } from "js-yaml";

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

export const parseYamlAsync = usingWorkerTask<
  string,
  | { result: unknown; error: undefined }
  | { error: YAMLException; result: undefined }
>(ParseYamlWorker);
