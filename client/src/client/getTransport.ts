import { Dictionary, first, keys } from "lodash";
import { RPCTransport } from "./RPCTransport";
import { TransportConstructor } from "./Transport";

type TransportEntry = {
  name: string;
  constructor: TransportConstructor;
};

export const transports: Dictionary<TransportEntry> = {
  socketio: { name: "socket.io", constructor: RPCTransport },
};

export function getTransport(key: string) {
  return transports[key].constructor;
}

export const defaultTransport = first(keys(transports))!;
