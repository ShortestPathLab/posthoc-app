import { JSONRPCClient, JSONRPCResponse as Response } from "json-rpc-2.0";
import { NameMethodMap } from "protocol";
import { Request, RequestOf, ResponseOf } from "protocol/Message";
import { io, Socket } from "socket.io-client";
import { Transport, TransportOptions } from "./Transport";

export class SocketIOTransport implements Transport {
  rpc: JSONRPCClient;
  socket: Socket;

  constructor(readonly options: TransportOptions) {
    this.socket = io(options.url);
    this.rpc = new JSONRPCClient(async (request: Request) => {
      const listener = (response: Response) => {
        if (response.id === request.id) {
          this.socket.off("response", listener);
          this.rpc.receive(response);
        }
      };
      this.socket.emit("request", request);
      this.socket.on("response", listener);
    });
  }

  async connect() {
    this.socket.connect();
  }

  async disconnect() {
    this.socket.disconnect();
  }

  async call<T extends keyof NameMethodMap>(
    name: T,
    params?: RequestOf<NameMethodMap[T]>["params"]
  ): Promise<ResponseOf<NameMethodMap[T]>["result"]> {
    return await this.rpc.request(name, params);
  }
}
