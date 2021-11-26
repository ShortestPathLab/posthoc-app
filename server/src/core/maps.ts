import { keys, some, startCase } from "lodash";
import { parse, relative, resolve } from "path";
import { handlers } from "./scenario";

export const mapsPath = "./static/maps";

export type MapTypeKey = keyof typeof handlers;

export function mapIsSupported(path: string) {
  return some(keys(handlers), (t) => path.endsWith(`.${t}`));
}

export function getMapDescriptor(path: string) {
  const file = parse(path);
  return {
    id: relative(resolve(mapsPath), path),
    name: file.name,
    format: file.ext.slice(1),
    description: relative(resolve(mapsPath), path),
  };
}
