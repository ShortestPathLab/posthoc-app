import { NameMethodMap } from "protocol";
import { RequestOf, ResponseOf } from "protocol/Message";

export interface Transport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  call<T extends keyof NameMethodMap>(
    name: T,
    params?: RequestOf<NameMethodMap[T]>["params"]
  ): Promise<ResponseOf<NameMethodMap[T]>["result"]>;
}

export type TransportOptions = {
  url: string;
};

export type TransportConstructor = new (options: TransportOptions) => Transport;