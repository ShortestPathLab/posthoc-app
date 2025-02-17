import { load, YAMLException } from "js-yaml";
import { usingMessageHandler } from "./usingWorker";

onmessage = usingMessageHandler(async (str: MessageEvent<string>) => {
  try {
    return { result: load(str.data) };
  } catch (e: unknown) {
    if (e instanceof YAMLException) return { error: e };
    throw e;
  }
});
