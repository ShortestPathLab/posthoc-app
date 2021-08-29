import {
  CheckConnectionMethod,
  CheckConnectionRequest,
  CheckConnectionResponse,
} from "protocol/CheckConnection";
import { createRPCMethod as createMethod } from "../src/RPCServer";
import { usingE2E } from "./e2e";

test("RPC server responds to ping", async () => {
  let response: CheckConnectionResponse | undefined;
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
  expect(response?.result).toBeDefined();
});
