"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usingE2E = exports.PORT = void 0;
const socket_io_client_1 = require("socket.io-client");
const RPCServer_1 = require("../src/RPCServer");
exports.PORT = 8002;
async function usingClient(handler) {
    const client = (0, socket_io_client_1.io)(`http://localhost:${exports.PORT}/`);
    client.connect();
    await handler(client);
    client.disconnect();
}
async function usingServer(options, handler) {
    const server = new RPCServer_1.RPCServer({ port: exports.PORT, ...options });
    await server.listen();
    await handler(server);
    server.close();
}
async function usingE2E(serverOptions, handler) {
    return usingServer(serverOptions, (server) => usingClient((client) => handler(client, server)));
}
exports.usingE2E = usingE2E;
//# sourceMappingURL=e2e.js.map