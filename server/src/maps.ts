import { keys, some, startCase } from "lodash-es";
import { parse, relative, resolve } from "path";
import { grid } from "./scenario";

export const mapsPath = "./static/maps";

export type MapTypeKey = keyof typeof mapTypes;

export const mapTypes = {
  grid,
};

export function mapIsSupported(path: string) {
  return some(keys(mapTypes), (t) => path.endsWith(`.${t}`));
}

export function getMapDescriptor(path: string) {
  const file = parse(path);
  return {
    id: relative(resolve(mapsPath), path),
    name: startCase(file.name),
    type: file.ext.slice(1),
    description: file.name,
  };
}
