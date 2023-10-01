import { Dictionary } from "lodash";
import { PathfindingTask, Scheme } from "protocol/SolveTask";
import url from "url-parse";
import { Transport } from "./Transport";

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
            id: "grid",
            name: "Grid",
          },
          {
            id: "xy",
            name: "Network",
          },
          {
            id: "mesh",
            name: "Mesh",
          },
        ];
      case "features/algorithms":
        return [
          {
            id: "identity",
            name: "Unknown",
            hidden: true,
          },
        ];
      case "solve/pathfinding":
        const { parameters } = (params as PathfindingTask<{
          content?: string;
        }>["params"])!;
        try {
          return JSON.parse(parameters?.content ?? "");
        } catch {
          return {};
        }
    }
  },
};
