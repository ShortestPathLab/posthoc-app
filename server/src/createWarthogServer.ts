import { readFile } from "fs/promises";
import glob from "glob-promise";
import { filter, first, map, memoize as memo, some, startCase } from "lodash";
import { join, parse, relative } from "path";
import { PORT } from "./index";
import { createRPCMethod as createMethod, RPCServer } from "./RPCServer";

const ALGORITHMS_PATH = "./static/algorithms";
const MAPS_PATH = "./static/maps";

const SUPPORTED_MAP_TYPES = ["grid", "co", "gr", "scen"];

function mapIsSupported(path: string) {
  return some(SUPPORTED_MAP_TYPES, (t) => path.endsWith(`.${t}`));
}

function getMapDescriptor(path: string) {
  const f = parse(path);
  return {
    id: relative(join(__dirname, MAPS_PATH), path),
    name: startCase(f.name),
    type: f.ext.slice(1),
    description: f.name,
  };
}

async function getFiles(path: string) {
  return await glob(`${join(__dirname, path)}/**/*`);
}

export function createWarthogServer() {
  return new RPCServer({
    port: PORT,
    methods: [
      /**
       * Returns server information.
       */
      createMethod("about", async () => ({
        name: "Warthog Visualiser Server",
        version: "1.0.1",
      })),
      /**
       * Returns supported algorithms.
       */
      createMethod(
        "features/algorithm",
        memo(async () => {
          // TODO Replace with real handler
          // Currently just returns the files in the algorithms folder
          const files = await getFiles(ALGORITHMS_PATH);
          return map(files, (f) => ({
            id: parse(f).name,
            name: startCase(parse(f).name),
            description: parse(f).name,
          }));
        })
      ),
      /**
       * Returns supported map types.
       */
      createMethod(
        "features/mapType",
        memo(async () =>
          map(SUPPORTED_MAP_TYPES, (t) => ({
            id: t,
            name: startCase(t),
            description: t,
          }))
        )
      ),
      /**
       * Returns template map descriptors.
       */
      createMethod(
        "features/maps",
        memo(async () => {
          const maps = filter(await getFiles(MAPS_PATH), mapIsSupported);
          return map(maps, getMapDescriptor);
        })
      ),
      /**
       * Returns a particular map.
       */
      createMethod(
        "features/map",
        memo(
          async ({ id }) => {
            const map = first(await glob(join(__dirname, MAPS_PATH, id)));
            return map
              ? {
                  ...getMapDescriptor(map),
                  content: await readFile(map, "utf8"),
                }
              : undefined;
          },
          ({ id }) => id
        )
      ),
      /**
       * Returns a pathfinding solution.
       */
      createMethod("solve/pathfinding", async ({ algorithm }) => {
        // TODO Replace with real handler
        // Currently just returns the file from the algorithms folder
        const path = join(__dirname, ALGORITHMS_PATH, `${algorithm}.json`);
        return JSON.parse(await readFile(path, "utf-8"));
      }),
    ],
  });
}
