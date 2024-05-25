import { compressToUint8Array as compress } from "lz-string";
import { usingMessageHandler } from "./usingWorker";
onmessage = usingMessageHandler(async (str: MessageEvent<string>) =>
  compress(str.data)
);
