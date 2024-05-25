import { load } from "js-yaml";
import { usingMessageHandler } from "./usingWorker";

onmessage = usingMessageHandler(async (str: MessageEvent<string>) =>
  load(str.data)
);
