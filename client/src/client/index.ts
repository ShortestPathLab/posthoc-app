import { Dictionary, first, keys } from "lodash-es";
import { IPCTransport } from "./IPCTransport";
import { NativeTransport } from "./NativeTransport";
import { SocketIOTransport } from "./SocketIOTransport";
import { TransportConstructor } from "./Transport";

type TransportEntry = {
  name: string;
  constructor: TransportConstructor;
};

export const transports: Record<string, TransportEntry> = {
  native: { name: "Internal", constructor: NativeTransport },
  socketio: { name: "socket.io", constructor: SocketIOTransport },
  ipc: { name: "Web Worker", constructor: IPCTransport },
};

export function getTransport(key: string) {
  return transports[key].constructor;
}

export const defaultTransport = first(keys(transports))!;
