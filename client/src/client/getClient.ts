import { once } from "lodash";
import { RPCClient } from "./RPCClient";

const DEV_PORT = 8001;

const { hostname, protocol } = window.location;
const isLocalHost = hostname === "localhost";

const registry =
  "https://raw.githubusercontent.com/Pathfinding-Project/registry/master/index.json";

type Registry = string[];

export const getClient = once(async () => {
  if (isLocalHost) {
    return new RPCClient({
      url: `${protocol}//${hostname}:${DEV_PORT}/`,
    });
  } else {
    const response = await fetch(registry);
    const servers = (await response.json()) as Registry;
    return new RPCClient({
      url: servers[0],
    });
  }
});
