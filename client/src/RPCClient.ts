import { JSONRPCClient, JSONRPCResponse as Response } from "json-rpc-2.0";
import { Method, Request, RequestOf, ResponseOf } from "protocol/Message";
import { io, Socket } from "socket.io-client";

export interface RPCClientOptions {
  url?: string;
}

export class RPCClient {
  rpc: JSONRPCClient;
  socket: Socket;

  constructor(readonly options: RPCClientOptions = {}) {
    this.socket = io(options.url ?? "http://localhost/");
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

  async call<T extends Method>(
    name: RequestOf<T>["method"],
    params?: RequestOf<T>["params"]
  ): Promise<ResponseOf<T>["result"]> {
    return await this.rpc.request(name, params);
  }
}
