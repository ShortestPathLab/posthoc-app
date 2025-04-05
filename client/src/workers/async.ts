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

export const compressAsync = usingWorkerTask<string, string>(CompressWorker);
export const compressBinaryAsync = usingWorkerTask<string, Uint8Array>(
  CompressBinaryWorker
);
export const decompressBinaryAsync = usingWorkerTask<
  ReadableStream<Uint8Array> | Uint8Array,
  string
>(DecompressBinaryWorker);

export const parseYamlAsync = usingWorkerTask<
  string,
  | { result: unknown; error: undefined }
  | { error: YAMLException; result: undefined }
>(ParseYamlWorker);
