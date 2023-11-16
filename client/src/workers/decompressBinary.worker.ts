import { decompressFromUint8Array as decompress } from "lz-string";
onmessage = (str: MessageEvent<Uint8Array>) =>
  postMessage(decompress(str.data));
