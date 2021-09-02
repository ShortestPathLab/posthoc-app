import { memoize, startCase } from "lodash";
import { join, parse } from "path";
import { CheckConnectionMethod } from "protocol/CheckConnection";
import { AlgorithmFeatureQueryMethod } from "protocol/FeatureQuery";
import { PathfindingTaskMethod } from "protocol/SolveTask";
import { createRPCMethod as createMethod, RPCServer } from "./RPCServer";
import { initialise as initialiseStaticServer } from "./staticServer";
import { readdir, readFile } from "fs/promises";

const ALGORITHMS_PATH = "./static/algorithms";

initialiseStaticServer();

const rpcServer = new RPCServer({
  methods: [
    createMethod<CheckConnectionMethod>("about", async () => ({
      name: "Warthog Visualiser Server",
      version: "1.0.1",
    })),
    createMethod<AlgorithmFeatureQueryMethod>(
      "features/algorithm",
      memoize(async () => {
        // TODO Replace with real handler
        // Currently just returns the files in the algorithms folder
        const path = join(__dirname, ALGORITHMS_PATH);
        const files = await readdir(path);
        return files.map((f) => ({
          id: parse(f).name,
          name: startCase(parse(f).name),
          description: f,
        }));
      })
    ),
    createMethod<PathfindingTaskMethod>(
      "solve/pathfinding",
      async ({ algorithm }) => {
        // TODO Replace with real handler
        // Currently just returns the file from the algorithms folder
        const path = join(__dirname, ALGORITHMS_PATH, `${algorithm}.json`);
        const file = await readFile(path, "utf-8");
        return JSON.parse(file);
      }
    ),
  ],
});

rpcServer.listen();
