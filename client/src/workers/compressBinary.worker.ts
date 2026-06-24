import * as Comlink from "comlink";
import { compressToUint8Array as compress } from "lz-string";

export function compressBinary(value: string): Uint8Array<ArrayBuffer> {
  const out = compress(value) as Uint8Array<ArrayBuffer>;
  // Hand the backing buffer to the main thread instead of copying it.
  return Comlink.transfer(out, [out.buffer]);
}
