import { Dictionary, first, keys } from "lodash";
import { IPCTransport } from "./IPCTransport";
import { SocketIOTransport } from "./SocketIOTransport";
import { TransportConstructor } from "./Transport";

type TransportEntry = {
  name: string;
  constructor: TransportConstructor;
};

export const transports: Dictionary<TransportEntry> = {
  socketio: { name: "socket.io", constructor: SocketIOTransport },
  ipc: { name: "Web Worker", constructor: IPCTransport },
};

export function getTransport(key: string) {
  return transports[key].constructor;
}

export const defaultTransport = first(keys(transports))!;
