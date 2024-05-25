import md5 from "md5";
import { usingMessageHandler } from "./usingWorker";
onmessage = usingMessageHandler(async (str: MessageEvent<string>) =>
  md5(str.data)
);
