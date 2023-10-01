import { NameMethodMap } from "protocol";
import { RequestOf, ResponseOf } from "protocol/Message";
import url from "url-parse";
import { internal } from "./internal";
import { Transport, TransportOptions } from "./Transport";

export class NativeTransport implements Transport {
  handler: Transport["call"];
  constructor(readonly options: TransportOptions) {
    const { hostname } = url(options.url);
    this.handler = internal[hostname];
  }

  async connect() {}

  async disconnect() {}

  async call<T extends keyof NameMethodMap>(
    name: T,
    params?: RequestOf<NameMethodMap[T]>["params"]
  ): Promise<ResponseOf<NameMethodMap[T]>["result"]> {
    return await this.handler(name, params);
  }
}