import { delay, now } from "lodash-es";

export function wait(ms: number) {
  return new Promise((res) => delay(res, ms));
}
export async function timed<T>(task: () => Promise<T>, ms: number = 2500) {
  const from = now();
  const result = (await Promise.any([task(), wait(ms)])) as T | undefined;
  return { result, delta: now() - from };
}
