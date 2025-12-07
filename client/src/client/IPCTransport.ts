import { JSONRPCClient, JSONRPCResponse as Response } from "json-rpc-2.0";
import { NameMethodMap } from "protocol";
import { Request, RequestOf, ResponseOf } from "protocol/Message";
import { IPCWorker } from "workers";
import { EventEmitter } from "./EventEmitter";
import { Transport, TransportEvents, TransportOptions } from "./Transport";

export class IPCTransport
  extends EventEmitter<TransportEvents>
  implements Transport
{
  worker: Worker;
  rpc: JSONRPCClient;

  constructor(readonly options: TransportOptions) {
    super();
    this.worker = IPCWorker();
    this.rpc = new JSONRPCClient(async (request: Request) => {
      const listener = ({ data }: MessageEvent<Response>) => {
        if (data.id === request.id) {
          this.rpc.receive(data);
          this.worker.removeEventListener("message", listener);
        }
      };
      this.worker.postMessage(request);
      this.worker.addEventListener("message", listener);
    });
  }

  connect() {
    this.worker.postMessage(this.options.url);
    return new Promise<void>((res) => {
      const listener = () => {
        res();
        this.worker.removeEventListener("message", listener);
      };
      this.worker.addEventListener("message", listener);
    });
  }

  async disconnect() {
    this.worker.terminate();
  }

  async call<T extends keyof NameMethodMap>(
    name: T,
    params?: RequestOf<NameMethodMap[T]>["params"],
  ): Promise<ResponseOf<NameMethodMap[T]>["result"]> {
    return await this.rpc.request(name, params);
  }
}
