import { once } from "lodash";
import { RPCClient } from "./RPCClient";

const DEV_URL = "http://localhost:8001/";

export const getClient = once(async () => new RPCClient({ url: DEV_URL }));
