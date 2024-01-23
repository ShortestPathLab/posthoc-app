import { watch } from "chokidar";
import { getConfig } from "config";
import { readFile, stat } from "fs/promises";
import glob from "glob-promise";
import { map, startCase } from "lodash";
import memo from "memoizee";
import { resolve as _resolve, isAbsolute, join, parse, relative } from "path";
import untildify from "untildify";
import { createMethod } from "./createMethod";
import { load } from "js-yaml";

function name(s: string) {
  return s.split(".").shift();
}

function resolve(path: string) {
  return isAbsolute(path) ? path : _resolve(untildify(path));
}

const root = resolve(getConfig().path);

async function getFiles(path: string) {
  return await glob(`${_resolve(path)}/**/*.trace.@(yml|yaml|json)`);
}

export async function getTraceDescriptor(path: string) {
  const file = parse(path);
  const { mtime } = await stat(path);
  return {
    id: relative(root, path),
    name: startCase(name(file.name)),
    format: file.ext.slice(1),
    description: relative(root, path),
    lastModified: mtime.valueOf(),
  };
}

const getTraces = memo(async () => {
  const files = await getFiles(root);
  return await Promise.all(map(files, getTraceDescriptor));
});

const getTrace = memo(async ({ id }) => {
  const path = join(root, id);
  const file = await readFile(path, "utf-8");
  return {
    ...getTraceDescriptor(path),
    content: load(file),
  };
});

watch(root).on("all", (e) => {
  getTrace.clear();
  getTraces.clear();
});

export const features = [
  /**
   * Returns template map descriptors.
   */
  createMethod("features/traces", getTraces),
  createMethod("features/trace", getTrace),
];
