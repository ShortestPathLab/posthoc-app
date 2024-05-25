import { decompressFromUint8Array as decompress } from "lz-string";
import { usingMessageHandler } from "./usingWorker";
onmessage = usingMessageHandler(async (str: MessageEvent<Uint8Array>) =>
  decompress(str.data)
);
