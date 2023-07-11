"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = exports.grid = void 0;
const lodash_1 = require("lodash");
const pathfinding_binaries_1 = require("pathfinding-binaries");
const exec_1 = require("../helpers/exec");
function grid(m, { instances }) {
    const [, h, w] = (0, lodash_1.split)(m, "\n");
    const [width, height] = (0, lodash_1.map)([w, h], (d) => +(0, lodash_1.last)((0, lodash_1.split)(d, " ")));
    return (path) => (0, lodash_1.join)([
        "version 1",
        ...(0, lodash_1.map)(instances, ({ start, end }) => (0, lodash_1.join)([
            0,
            path,
            width,
            height,
            start % width,
            (0, lodash_1.floor)(start / width),
            end % width,
            (0, lodash_1.floor)(end / width),
            0,
        ], " ")),
    ], "\n");
}
exports.grid = grid;
exports.handlers = {
    grid: {
        create: grid,
        invoke: (alg, scen) => (0, exec_1.exec)(pathfinding_binaries_1.warthog, { args: { alg, scen }, flags: ["verbose"] }, true),
    },
    xy: {
        create: (_, { instances }) => {
            const instance = (0, lodash_1.first)(instances);
            if (instance) {
                const { start = 0, end = 0 } = instance;
                return (0, lodash_1.constant)(`p aux sp p2p 1\nq ${start + 1} ${end + 1}\n`);
            }
        },
        invoke: (alg, scen, m) => (0, exec_1.exec)(pathfinding_binaries_1.roadhog, { args: { alg, problem: scen, input: m }, flags: ["verbose"] }, true),
    },
};
//# sourceMappingURL=scenario.js.map