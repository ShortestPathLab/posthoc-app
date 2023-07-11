import Cache from "lru-cache";
import hash from "md5";
import { env } from "process";
import { Scheme } from "protocol/SolveTask";
import { URL } from "url";
import { decompressFromBase64 as decompress } from "lz-string";

/**
 * Specifies the maximum amount of maps that can be cached at a given time.
 * @default 500e6
 */
const CACHE_SIZE = env.CACHE_SIZE ? +env.CACHE_SIZE : 500e6;

const cache = new Cache<string, string>({ max: CACHE_SIZE });

export function parseURI(uri: string) {
  const { protocol, pathname } = new URL(uri);
  return {
    scheme: protocol as Scheme,
    content: decodeURIComponent(pathname),
  };
}

export function getMap(uri: string) {
  const { scheme, content } = parseURI(uri);
  switch (scheme) {
    case "map:":
      cache.set(hash(content), content);
      return content;
    case "lz:":
      const decompressed = decompress(content);
      cache.set(hash(decompressed), decompressed);
      return decompressed;
    case "hash:":
      return cache.get(content);
  }
}
