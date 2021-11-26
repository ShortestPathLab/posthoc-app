import md5 from "md5";

onmessage = (str: MessageEvent<string>) => postMessage(md5(str.data));
