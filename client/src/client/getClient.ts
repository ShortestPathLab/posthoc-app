import { once } from "lodash";
import { RPCClient } from "./RPCClient";

const PORT = 8001;

export const getClient = once(
  async () =>
    new RPCClient({
      url: `${window.location.protocol}//${window.location.hostname}:${PORT}/`,
    })
);
