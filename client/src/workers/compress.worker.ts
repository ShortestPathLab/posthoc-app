import { compressToBase64 as compress } from "lz-string";
import { usingMessageHandler } from "./usingWorker";
onmessage = usingMessageHandler(async (str: MessageEvent<string>) =>
  compress(str.data)
);
