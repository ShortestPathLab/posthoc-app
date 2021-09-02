import { readdir, readFile } from "fs/promises";
import { memoize, startCase } from "lodash";
import { join, parse } from "path";
import { createRPCMethod as createMethod, RPCServer } from "./RPCServer";
import { initialise as initialiseStaticServer } from "./staticServer";

const ALGORITHMS_PATH = "./static/algorithms";
const SERVER_NAME = "warthog";

initialiseStaticServer();

const rpcServer = new RPCServer({
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
      memoize(async () => {
        // TODO Replace with real handler
        // Currently just returns the files in the algorithms folder
        const path = join(__dirname, ALGORITHMS_PATH);
        const files = await readdir(path);
        return files.map((f) => ({
          id: parse(f).name,
          name: startCase(parse(f).name),
          description: `${SERVER_NAME}/${f}`,
        }));
      })
    ),
    /**
     * Returns supported map types.
     */
    createMethod("features/mapType", async () => []),
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

rpcServer.listen();
