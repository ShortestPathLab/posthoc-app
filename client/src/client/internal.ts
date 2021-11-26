import { PathfindingTask, Scheme } from "protocol/SolveTask";
import { Transport } from "./Transport";
import url from "url-parse";
import { Dictionary } from "lodash";

export function parseURI(uri: string) {
  const { protocol, pathname } = url(uri);
  return {
    scheme: protocol as Scheme,
    content: decodeURIComponent(pathname),
  };
}

export const internal: Dictionary<Transport["call"]> = {
  trace: async (name, params) => {
    switch (name) {
      case "about":
        return {
          name: "Search Trace",
          description: "Provides JSON Search Trace Support",
          version: "1.0.2",
        };
      case "features/formats":
        return [
          {
            id: "json",
            name: "Search Trace",
          },
        ];
      case "solve/pathfinding":
        const { mapURI } = (params as PathfindingTask["params"])!;
        const { scheme, content } = parseURI(mapURI);
        if (["map:", "trace:"].includes(scheme)) return JSON.parse(content);
    }
  },
};
