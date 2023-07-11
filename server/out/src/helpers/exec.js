"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = exports.ExecError = void 0;
const exec_sh_1 = __importDefault(require("exec-sh"));
const lodash_1 = require("lodash");
const sh = exec_sh_1.default.promise;
class ExecError extends Error {
}
exports.ExecError = ExecError;
async function exec(path, { params = [], args = {}, flags = [] } = {}, errorsAsOutput) {
    const command = [
        path,
        ...(0, lodash_1.entries)(args).map(([k, v]) => `--${k} ${v}`),
        ...flags.map((s) => `--${s}`),
        ...params,
    ];
    const { stdout, stderr } = await sh(command.join(" "), true);
    if (!stderr) {
        return (0, lodash_1.trim)(stdout);
    }
    else if (errorsAsOutput) {
        return (0, lodash_1.trim)((0, lodash_1.join)([stderr, stdout], "\n"));
    }
    else
        throw new ExecError(stderr);
}
exports.exec = exec;
//# sourceMappingURL=exec.js.map