import {
  CheckConnectionRequest,
  CheckConnectionResponse,
} from "protocol/CheckConnection";
import { createMethod } from "../src/methods/createMethod";
import { usingE2E } from "./e2e";

test("RPC server responds to ping", async () => {
  let response: CheckConnectionResponse | undefined;
  await usingE2E(
    {
      methods: [
        createMethod("about", async () => ({
          version: "1.0.2",
        })),
      ],
    },
    (client) =>
      new Promise<void>((res) => {
        const request: CheckConnectionRequest = {
          method: "about",
          id: 1,
        };
        client.emit("request", request);
        client.on("response", (r) => {
          response = r;
          res();
        });
      })
  );
  expect(response?.result?.version).toBeDefined();
});
