"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.general = void 0;
const createMethod_1 = require("./createMethod");
exports.general = [
    /**
     * Returns server information.
     */
    (0, createMethod_1.createMethod)("about", async () => ({
        name: "Warthog",
        version: "1.0.2",
        description: "Solver Adapter for Warthog & Roadhog",
    })),
];
//# sourceMappingURL=general.js.map