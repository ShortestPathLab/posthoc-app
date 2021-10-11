import Cache from "lru-cache";
import hash from "md5";
import { env } from "process";
import { Scheme } from "protocol/SolveTask";
import { URL } from "url";

/**
 * Specifies the maximum amount of maps that can be cached at a given time.
 * @default 100
 */
const CACHE_SIZE = env.CACHE_SIZE ? +env.CACHE_SIZE : 100;

export function parseURI(uri: string) {
  const { protocol, pathname } = new URL(uri);
  return {
    scheme: protocol as Scheme,
    content: decodeURIComponent(pathname),
  };
}

export function getMap(uri: string) {
  const cache = new Cache<string, string>({ max: CACHE_SIZE });
  const { scheme, content } = parseURI(uri);
  if (scheme === "map:") cache.set(hash(content), content);
  return cache.get(hash(content));
}
