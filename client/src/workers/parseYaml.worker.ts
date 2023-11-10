import { load } from "js-yaml";

onmessage = (str: MessageEvent<string>) => postMessage(load(str.data));
