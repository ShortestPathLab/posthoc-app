import { keys, some, startCase } from "lodash";
import { parse, relative, resolve } from "path";
import { getConfig } from "../config";

const handlers = { grid: undefined };

export type MapTypeKey = keyof typeof handlers;

export function mapIsSupported(path: string) {
  return some(keys(handlers), (t) => path.endsWith(`.${t}`));
}

export async function getMapDescriptor(path: string) {
  const { maps: mapsPath } = getConfig();
  const file = parse(path);
  return {
    id: relative(resolve(mapsPath), path),
    name: startCase(file.name),
    format: file.ext.slice(1),
    description: relative(resolve(mapsPath), path),
  };
}
