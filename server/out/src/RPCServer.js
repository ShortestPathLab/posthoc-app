"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPCServer = void 0;
const http_1 = require("http");
const json_rpc_2_0_1 = require("json-rpc-2.0");
const lodash_1 = require("lodash");
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
class RPCServer {
    constructor(options = {}) {
        this.options = options;
        this.express = (0, express_1.default)();
        this.server = (0, http_1.createServer)(this.express);
        this.rpc = new json_rpc_2_0_1.JSONRPCServer();
        this.io = new socket_io_1.Server(this.server, {
            cors: { origin: "*" },
            maxHttpBufferSize: 1e100,
            perMessageDeflate: true,
            httpCompression: true,
        });
        (0, lodash_1.forEach)(options?.methods, ({ name, handler }) => {
            this.rpc.addMethod(name, handler);
        });
    }
    listen() {
        this.express.get("/", (_, res) => res.send("JSON-RPC 2.0"));
        this.io.on("connection", (socket) => {
            socket.on("request", async (req) => {
                socket.emit("response", await this.rpc.receive({ jsonrpc: "2.0", ...req }));
            });
        });
        return new Promise((res) => this.server.listen(this.options.port ?? 8001, res));
    }
    close() {
        this.io.removeAllListeners();
        this.server.close();
    }
}
exports.RPCServer = RPCServer;
//# sourceMappingURL=RPCServer.js.map