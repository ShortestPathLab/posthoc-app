import { JSONRPCServer } from "json-rpc-2.0";
import express, { Express } from "express";
import { Server as WebSocketServer } from "socket.io";
import { Server as HTTPServer, createServer as createHTTPServer } from "http";
import { Method, Request } from "protocol/Message";
import { forEach } from "lodash";

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
  httpServer: HTTPServer;
  rpcServer: JSONRPCServer;
  app: Express;
  io: WebSocketServer;

  constructor(public options: RPCServerOptions = {}) {
    this.app = express();
    this.httpServer = createHTTPServer(this.app);
    this.rpcServer = new JSONRPCServer();
    this.io = new WebSocketServer(this.httpServer);
    forEach(options?.methods, ({ name, handler }) => {
      this.rpcServer.addMethod(name, handler);
    });
  }

  listen() {
    this.io.on("connection", (socket) => {
      socket.on("request", async (req: Request) => {
        socket.emit(
          "response",
          await this.rpcServer.receive({ jsonrpc: "2.0", ...req })
        );
      });
    });
    return new Promise<void>((res) =>
      this.httpServer.listen(this.options.port ?? 8001, res)
    );
  }

  close() {
    this.io.removeAllListeners();
    this.httpServer.close();
  }
}
