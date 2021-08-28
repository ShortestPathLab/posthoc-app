import { JSONRPCServer } from "json-rpc-2.0";
import express, { Express } from "express";
import { Server as WebSocketServer, Socket } from "socket.io";
import { Server as HTTPServer, createServer as createHTTPServer } from "http";
import { Request } from "protocol/Message";

export class RPCServer {
  httpServer: HTTPServer;
  server: JSONRPCServer;
  app: Express;
  io: WebSocketServer;

  constructor() {
    this.app = express();
    this.httpServer = createHTTPServer(this.app);
    this.server = new JSONRPCServer();
    this.io = new WebSocketServer(this.httpServer);
  }

  async listen() {
    this.io.on("connection", (socket) => {
      socket.on("request", async (req: Request) => {
        socket.emit(
          "response",
          await this.server.receive({ jsonrpc: "2.0", ...req })
        );
      });
    });
    this.httpServer.listen(8001);
  }
}
