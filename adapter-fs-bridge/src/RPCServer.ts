import { createServer as createHTTPServer } from "http";
import {
  JSONRPCClient,
  JSONRPCServer,
  JSONRPCResponse as Response,
} from "json-rpc-2.0";
import { forEach, map } from "lodash";
import { Method, Request, RequestOf } from "protocol/Message";
import { Server as WebSocketServer } from "socket.io";
import express from "express";
import TypedEmitter, { EventMap } from "typed-emitter";
import { NameMethodMap } from "protocol";

export type RPCServiceEvents = {
  call: (request: RequestOf<NameMethodMap[keyof NameMethodMap]>) => void;
};

export interface RPCServerOptions {
  methods?: Method[];
  services?: TypedEmitter<RPCServiceEvents>[];
  port?: number;
}

export class RPCServer {
  express = express();
  server = createHTTPServer(this.express);
  rpc = new JSONRPCServer();
  io = new WebSocketServer(this.server, {
    cors: { origin: "*" },
    maxHttpBufferSize: 1e100,
    perMessageDeflate: true,
    httpCompression: true,
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
      // Create RPC Client
      const client = new JSONRPCClient(async (request: Request) => {
        const listener = (response: Response) => {
          if (response.id === request.id) {
            socket.off("response", listener);
            client.receive(response);
          }
        };

        socket.emit("request", request);
        socket.on("response", listener);
      });
      const f = (
        request: RequestOf<NameMethodMap[keyof NameMethodMap]>
      ): void => {
        client.send(request);
      };
      // Bind services to RPC Client
      map(this.options.services, (service) => service.on("call", f));
      socket.on("disconnect", () =>
        map(this.options.services, (service) => service.off("call", f))
      );
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
