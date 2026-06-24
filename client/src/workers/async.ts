import * as Comlink from "comlink";
import memoizee from "memoizee";
import objectHash from "object-hash";
import { Schema } from "ajv";
import { endpointSymbol } from "vite-plugin-comlink/symbol";
import { withWorker } from "workers/workerLanes";
import type { ParseYamlResult } from "./parseYaml.worker";

type CompressWorkerModule = typeof import("./compress.worker");
type CompressBinaryWorkerModule = typeof import("./compressBinary.worker");
type DecompressBinaryWorkerModule = typeof import("./decompressBinary.worker");
type HashWorkerModule = typeof import("./hash.worker");
type ParseYamlWorkerModule = typeof import("./parseYaml.worker");

// vite-plugin-comlink rewrites `new ComlinkWorker(...)` into a statement ending
// in `;`, so each instantiation MUST sit on its own line (never inside an
// arrow/expression) or it produces invalid syntax. Hence these standalone
// factories rather than inline construction.
function spawnHashWorker() {
  const worker = new ComlinkWorker<HashWorkerModule>(
    new URL("./hash.worker.ts", import.meta.url),
  );
  return worker;
}

function spawnCompressWorker() {
  const worker = new ComlinkWorker<CompressWorkerModule>(
    new URL("./compress.worker.ts", import.meta.url),
  );
  return worker;
}

function spawnCompressBinaryWorker() {
  const worker = new ComlinkWorker<CompressBinaryWorkerModule>(
    new URL("./compressBinary.worker.ts", import.meta.url),
  );
  return worker;
}

function spawnDecompressBinaryWorker() {
  const worker = new ComlinkWorker<DecompressBinaryWorkerModule>(
    new URL("./decompressBinary.worker.ts", import.meta.url),
  );
  return worker;
}

function spawnParseYamlWorker() {
  const worker = new ComlinkWorker<ParseYamlWorkerModule>(
    new URL("./parseYaml.worker.ts", import.meta.url),
  );
  return worker;
}

const terminate = (w: { [endpointSymbol]: Worker }) => w[endpointSymbol].terminate();

export const hashAsync = memoizee(
  (value: string): Promise<string> =>
    withWorker("hash", spawnHashWorker, terminate, (w) => w.hash(value)),
  { normalizer: (args) => objectHash([...args]) },
);

export const compressAsync = (value: string): Promise<string> =>
  withWorker("compress", spawnCompressWorker, terminate, (w) => w.compressString(value));

export const compressBinaryAsync = (value: string): Promise<Uint8Array<ArrayBuffer>> =>
  withWorker("compress", spawnCompressBinaryWorker, terminate, (w) => w.compressBinary(value));

export const decompressBinaryAsync = (
  data: ReadableStream<Uint8Array<ArrayBuffer>> | Uint8Array<ArrayBuffer>,
  transferables?: Transferable[],
): Promise<string> =>
  withWorker("compress", spawnDecompressBinaryWorker, terminate, (w) =>
    w.decompressBinary(transferables ? Comlink.transfer(data, transferables) : data),
  );

export const parseYamlAsync = <T>({
  content,
  schema,
}: {
  content: string;
  schema?: Schema;
}): Promise<ParseYamlResult<T>> =>
  withWorker(
    "parse",
    spawnParseYamlWorker,
    terminate,
    (w) => w.parseYaml({ content, schema }) as Promise<ParseYamlResult<T>>,
  );
