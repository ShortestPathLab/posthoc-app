import { createServer as createHTTPServer } from "http";
import { JSONRPCServer } from "json-rpc-2.0";
import { forEach } from "lodash";
import { Method, Request } from "protocol/Message";
import { Server as WebSocketServer } from "socket.io";

export interface RPCServerOptions {
  methods?: Method[];
  port?: number;
}

export function createRPCMethod<T extends Method>(
  name: T["name"],
  handler: T["handler"]
) {
  return { name, handler };
}

export class RPCServer {
  server = createHTTPServer();
  rpc = new JSONRPCServer();
  io = new WebSocketServer(this.server, { cors: { origin: "*" } });
  constructor(readonly options: RPCServerOptions = {}) {
    forEach(options?.methods, ({ name, handler }) => {
      this.rpc.addMethod(name, handler);
    });
  }
  listen() {
    this.io.on("connection", (socket) => {
      socket.on("request", async (req: Request) => {
        socket.emit(
          "response",
          await this.rpc.receive({ jsonrpc: "2.0", ...req })
        );
      });
    });
    return new Promise<void>((res) =>
      this.server.listen(this.options.port ?? 8001, res)
    );
  }
  close() {
    this.io.removeAllListeners();
    this.server.close();
  }
}
