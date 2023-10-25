import { parse } from "yaml";

onmessage = (str: MessageEvent<string>) => postMessage(parse(str.data));
