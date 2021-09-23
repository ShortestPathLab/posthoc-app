import { readFile as read, writeFile as write } from "fs/promises";
import glob from "glob-promise";
import {
  filter,
  first,
  keys,
  map,
  memoize as memo,
  startCase,
  entries,
} from "lodash-es";
import { resolve } from "path";
import { warthog } from "pathfinding-binaries";
import { algorithms } from "./algorithms";
import { exec } from "./exec";
import {
  getMapDescriptor,
  mapIsSupported,
  mapsPath,
  MapTypeKey,
  mapTypes,
} from "./maps";
import { parseOutput } from "./parseOutput";
import { createRPCMethod as createMethod, RPCServer } from "./RPCServer";
import { usingTempFiles as temp } from "./usingTempFiles";

async function getFiles(path: string) {
  return await glob(`${resolve(path)}/**/*`);
}

export function createWarthogServer(port?: number) {
  return new RPCServer({
    port,
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
          return map(entries(algorithms), ([f, { name }]) => ({
            id: f,
            name: name,
            description: f,
          }));
        })
      ),
      /**
       * Returns supported map types.
       */
      createMethod(
        "features/mapType",
        memo(async () =>
          map(keys(mapTypes), (t) => ({
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
          const maps = filter(await getFiles(mapsPath), mapIsSupported);
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
            const map = first(await glob(resolve(mapsPath, id)));
            return map
              ? {
                  ...getMapDescriptor(map),
                  content: await read(map, "utf8"),
                }
              : undefined;
          },
          ({ id }) => id
        )
      ),
      /**
       * Returns a pathfinding solution.
       */
      createMethod("solve/pathfinding", ({ algorithm, mapType, ...params }) =>
        temp(async (scenarioPath, mapPath) => {
          const { create, transform } = mapTypes[mapType as MapTypeKey];
          const scenario = create(params);

          await Promise.all([
            write(scenarioPath, scenario(mapPath), "utf-8"),
            write(mapPath, params.mapURI, "utf-8"),
          ]);

          const output = await exec(
            warthog,
            {
              flags: {
                alg: { value: algorithm },
                scen: { value: scenarioPath },
                verbose: {},
              },
            },
            true
          );

          return transform(parseOutput(output));
        })
      ),
    ],
  });
}
