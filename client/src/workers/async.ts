import { YAMLException } from "js-yaml";
import memoizee from "memoizee";
import objectHash from "object-hash";
import {
  CompressBinaryWorker,
  CompressWorker,
  DecompressBinaryWorker,
  HashWorker,
  ParseYamlWorker,
} from ".";
import { usingWorkerTask } from "./usingWorker";

export const hashAsync = memoizee(usingWorkerTask<string, string>(HashWorker), {
  normalizer: (args) => objectHash([...args]),
});

export const compressAsync = memoizee(
  usingWorkerTask<string, string>(CompressWorker),
  {
    normalizer: (args) => objectHash([...args]),
  }
);
export const compressBinaryAsync = memoizee(
  usingWorkerTask<string, Uint8Array>(CompressBinaryWorker),
  {
    normalizer: (args) => objectHash([...args]),
  }
);
export const decompressBinaryAsync = memoizee(
  usingWorkerTask<Uint8Array, string>(DecompressBinaryWorker),
  {
    normalizer: (args) => objectHash([...args]),
  }
);

export const parseYamlAsync = usingWorkerTask<
  string,
  | { result: unknown; error: undefined }
  | { error: YAMLException; result: undefined }
>(ParseYamlWorker);
