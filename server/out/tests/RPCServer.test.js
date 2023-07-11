"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createMethod_1 = require("../src/methods/createMethod");
const e2e_1 = require("./e2e");
const vitest_1 = require("vitest");
(0, vitest_1.test)("RPC server responds to ping", async () => {
    let response;
    await (0, e2e_1.usingE2E)({
        methods: [
            (0, createMethod_1.createMethod)("about", async () => ({
                version: "1.0.2",
            })),
        ],
    }, (client) => new Promise((res) => {
        const request = {
            method: "about",
            id: 1,
        };
        client.emit("request", request);
        client.on("response", (r) => {
            response = r;
            res();
        });
    }));
    (0, vitest_1.expect)(response?.result?.version).toBeDefined();
});
//# sourceMappingURL=RPCServer.test.js.map