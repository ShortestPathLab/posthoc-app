import { compressToBase64 as compress } from "lz-string";

export function compressString(value: string): string {
  return compress(value);
}
