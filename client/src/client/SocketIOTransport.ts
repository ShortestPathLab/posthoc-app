import { JSONRPCClient, JSONRPCResponse as Response } from "json-rpc-2.0";
import { NameMethodMap } from "protocol";
import { Request, RequestOf, ResponseOf } from "protocol/Message";
import { Socket, io } from "socket.io-client";
import { EventEmitter } from "./EventEmitter";
import { Transport, TransportEvents, TransportOptions } from "./Transport";

export class SocketIOTransport
  extends EventEmitter<TransportEvents>
  implements Transport
{
  client: JSONRPCClient;
  socket: Socket;

  constructor(readonly options: TransportOptions) {
    super();
    this.socket = io(options.url);
    // Initialise client
    this.client = new JSONRPCClient(async (request: Request) => {
      const listener = (response: Response) => {
        if (response.id === request.id) {
          this.socket.off("response", listener);
          this.client.receive(response);
        }
      };
      this.socket.emit("request", request);
      this.socket.on("response", listener);
    });
    // Initialise server
    this.socket.on("request", ({ method, params }: Request) => {
      this.emit(method, params);
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
    return await this.client.request(name, params);
  }
}
