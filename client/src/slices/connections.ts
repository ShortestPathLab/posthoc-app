import { store } from "@davstack/store";
import { Transport } from "client/Transport";
import { CheckConnectionResponse } from "protocol/CheckConnection";

export type Connection = CheckConnectionResponse["result"] & {
  transport: () => Transport;
  url: string;
  ping: number;
};

export const connections = store<Connection[]>([], {
  name: "connections",
  devtools: { enabled: import.meta.env.DEV },
});
