"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdapter = void 0;
const features_1 = require("./methods/features");
const general_1 = require("./methods/general");
const solve_1 = require("./methods/solve");
const RPCServer_1 = require("./RPCServer");
function createAdapter(port) {
    return new RPCServer_1.RPCServer({
        port,
        methods: [...general_1.general, ...features_1.features, ...solve_1.solve],
    });
}
exports.createAdapter = createAdapter;
//# sourceMappingURL=createAdapter.js.map