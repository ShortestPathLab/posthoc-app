import { CheckConnectionResponse } from "protocol/CheckConnection";
import { createSlice } from "./createSlice";
import { replace } from "./reducers";
import { Transport } from "client/Transport";

export type Connection = CheckConnectionResponse["result"] & {
  transport: () => Transport;
  url: string;
  ping: number;
};

export const [useConnections, ConnectionsProvider] = createSlice<Connection[]>(
  [],
  { reduce: replace }
);
