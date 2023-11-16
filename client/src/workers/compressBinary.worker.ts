import { compressToUint8Array as compress } from "lz-string";
onmessage = (str: MessageEvent<string>) => postMessage(compress(str.data));
