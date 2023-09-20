import { compressToBase64 as compress } from "lz-string";

onmessage = (str: MessageEvent<string>) => postMessage(compress(str.data));
