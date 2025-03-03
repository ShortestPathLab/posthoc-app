import { delay, now, once } from "lodash-es";
import { Request, Response } from "protocol/Message";
import { Transport } from "client/Transport";

function wait(ms: number) {
  return new Promise((res) => delay(res, ms));
}

async function timed<T>(task: () => Promise<T>, ms: number = 500) {
  const from = now();
  const result = (await Promise.any([task(), wait(ms)])) as T | undefined;
  return { result, delta: now() - from };
}

const init = once(async (url: string = "") => {
  const { result } = await timed(() => import(/* @vite-ignore */ url));
  if (result) {
    const fn = (...args: unknown[]) => result.call(...args);
    return fn as Transport["call"];
  }
});

const process = async ({
  method,
  params,
}: Request): Promise<Partial<Response>> => {
  try {
    const call = await init();
    return call
      ? { result: await call(method, params) }
      : { error: { code: 500, message: "Could not connect." } };
  } catch (e) {
    return { error: { code: 500, message: `${e}` } };
  }
};

const queue: (Request | string)[] = [];

onmessage = async (msg: MessageEvent<string | Request>) => {
  queue.push(msg.data);
};

async function consume() {
  const data = queue.shift();
  if (data) {
    if (typeof data === "string") {
      await init(data);
      postMessage("ready");
    } else {
      const { id, ...req } = data;
      postMessage({ id, jsonrpc: "2.0", ...(await process(req)) });
    }
  }
  requestAnimationFrame(consume);
}

requestAnimationFrame(consume);
