import { Transport } from "client/Transport";
import { once } from "lodash";
import { Request, Response } from "protocol/Message";

const init = once(async (url: string = "") => {
  const res = await fetch(url);
  const fn = new Function(`${await res.text()};\nreturn call;`);
  return fn as Transport["call"];
});

const process = async ({
  method,
  params,
}: Request): Promise<Partial<Response>> => {
  try {
    const call = await init();
    return { result: await call(method, params) };
  } catch (e) {
    return { error: { code: 500, message: `${e}` } };
  }
};

onmessage = async (msg: MessageEvent<string | Request>) => {
  if (typeof msg.data === "string") {
    await init(msg.data);
    postMessage("ready");
  } else {
    const { id, ...req } = msg.data;
    postMessage({ id, jsonrpc: "2.0", ...process(req) });
  }
};
