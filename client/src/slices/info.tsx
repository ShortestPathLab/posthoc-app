import { createSlice } from "./createSlice";
import { CheckConnectionResponse } from "protocol/CheckConnection";
import { getClient } from "client/getClient";

type Info = CheckConnectionResponse["result"];

export const [useInfo, InfoProvider] = createSlice<Info | undefined>(
  undefined,
  async () => {
    const client = await getClient();
    return await client.call("about");
  }
);
