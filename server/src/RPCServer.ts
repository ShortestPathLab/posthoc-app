import { createServer as createHTTPServer } from "http";
import { JSONRPCServer } from "json-rpc-2.0";
import { forEach } from "lodash-es";
import { Method, Request } from "protocol/Message";
import { NameMethodMap } from "protocol";
import { Server as WebSocketServer } from "socket.io";
import express from "express";

export interface RPCServerOptions {
  methods?: Method[];
  port?: number;
}

export function createRPCMethod<T extends keyof NameMethodMap>(
  name: T,
  handler: NameMethodMap[T]["handler"]
) {
  return { name, handler };
}

export class RPCServer {
  express = express();
  server = createHTTPServer(this.express);
  rpc = new JSONRPCServer();
  io = new WebSocketServer(this.server, {
    cors: { origin: "*" },
    perMessageDeflate: true,
    maxHttpBufferSize: 1e100,
  });
  constructor(readonly options: RPCServerOptions = {}) {
    forEach(options?.methods, ({ name, handler }) => {
      this.rpc.addMethod(name, handler);
    });
  }
  listen() {
    this.express.get("/", (_, res) => res.send("JSON-RPC 2.0"));
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
