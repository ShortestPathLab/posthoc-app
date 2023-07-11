"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pathfinding_binaries_1 = require("pathfinding-binaries");
const vitest_1 = require("vitest");
const exec_1 = require("../helpers/exec");
(0, vitest_1.describe)("exec", () => {
    (0, vitest_1.it)("returns hello", async () => {
        const output = await (0, exec_1.exec)("echo", { params: ["hello"] });
        (0, vitest_1.expect)(output).toEqual("hello");
    });
    (0, vitest_1.it)("runs node with flags", async () => {
        const output = await (0, exec_1.exec)("node", {
            args: { eval: '"console.log(1+1)"' },
        });
        (0, vitest_1.expect)(output).toEqual("2");
    });
    (0, vitest_1.it)("runs the warthog solver", async () => {
        const output = await (0, exec_1.exec)(pathfinding_binaries_1.warthog, { flags: ["help"] }, true);
        (0, vitest_1.expect)(output.startsWith("==> manual <==")).toBeTruthy();
    });
});
//# sourceMappingURL=exec.test.js.map