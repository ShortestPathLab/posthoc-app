import { readFileSync } from "fs";
import { once } from "lodash";
import { resolve } from "path";
import { cwd, env } from "process";
import { parse } from "yaml";
import { z } from "zod";

const DEFAULT_PORT = 8221;

export const Config = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  port: z.optional(z.number()).default(DEFAULT_PORT),
});

export const getConfig = once(() => {
  const configPath = env["ADAPTER_CONFIG_PATH"] ?? "./adapter.config.yaml";
  const resolvedPath = resolve(cwd(), configPath);
  const file = readFileSync(resolvedPath, "utf8");
  try {
    return Config.parse(parse(file));
  } catch (e) {
    throw Error(e as any);
  }
});
