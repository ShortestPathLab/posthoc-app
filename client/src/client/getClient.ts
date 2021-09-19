import { once } from "lodash";
import { RPCClient } from "./RPCClient";

const DEV_PORT = 8001;

const { hostname, protocol } = window.location;
const isLocalHost = hostname === "localhost";

export const getClient = once(
  async () =>
    new RPCClient({
      url: isLocalHost
        ? `${protocol}//${hostname}:${DEV_PORT}/`
        : `${protocol}//${hostname}/`,
    })
);
