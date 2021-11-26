import { NameMethodMap } from "protocol";
import { RequestOf, ResponseOf } from "protocol/Message";
import { PathfindingTask, Scheme } from "protocol/SolveTask";
import { Transport, TransportOptions } from "./Transport";
import url from "url-parse";

export function parseURI(uri: string) {
  const { protocol, pathname } = url(uri);
  return {
    scheme: protocol as Scheme,
    content: decodeURIComponent(pathname),
  };
}

const internal: { [K in string]: Transport["call"] } = {
  trace: async (name, params) => {
    switch (name) {
      case "about":
        return {
          name: "Search Trace",
          description: "Provides JSON Search Trace Visualisation Functionality",
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

export class NativeTransport implements Transport {
  handler: Transport["call"];
  constructor(readonly options: TransportOptions) {
    const { hostname } = url(options.url);
    this.handler = internal[hostname];
  }

  async connect() {}

  async disconnect() {}

  async call<T extends keyof NameMethodMap>(
    name: T,
    params?: RequestOf<NameMethodMap[T]>["params"]
  ): Promise<ResponseOf<NameMethodMap[T]>["result"]> {
    return await this.handler(name, params);
  }
}
