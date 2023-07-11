"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = void 0;
const createAdapter_1 = require("./createAdapter");
exports.PORT = process.env.PORT ? +process.env.PORT : undefined;
const server = (0, createAdapter_1.createAdapter)(exports.PORT);
server.listen();
//# sourceMappingURL=index.js.map