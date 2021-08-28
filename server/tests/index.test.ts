import { createRPCMethod as createMethod } from "../RPCServer";
import {
  CheckConnectionMethod,
  CheckConnectionRequest,
  CheckConnectionResponse,
} from "protocol/CheckConnection";
import { usingE2E } from "./usingE2E";

test("RPC server responds to ping", async () => {
  let response: CheckConnectionResponse = {};
  await usingE2E(
    {
      methods: [
        createMethod<CheckConnectionMethod>("ping", async () => Date.now()),
      ],
    },
    (client) =>
      new Promise<void>((res) => {
        const request: CheckConnectionRequest = {
          method: "ping",
          id: 1,
        };
        client.emit("request", request);
        client.on("response", (r) => {
          response = r;
          res();
        });
      })
  );
  expect(response.result).toBeDefined();
});
