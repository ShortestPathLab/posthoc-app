"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.solve = exports.MAX_SOLUTION_SIZE = void 0;
const promises_1 = require("fs/promises");
const lodash_1 = require("lodash");
const tempy_1 = __importDefault(require("tempy"));
const map_1 = require("../core/map");
const scenario_1 = require("../core/scenario");
const createMethod_1 = require("./createMethod");
const { task: temp } = tempy_1.default.file;
/**
 * The maximum size, in UTF-8 characters of a solution,
 * before it is discarded for being too hard.
 * @default 50e6
 */
exports.MAX_SOLUTION_SIZE = process.env.MAX_SOLUTION_SIZE
    ? +process.env.MAX_SOLUTION_SIZE
    : 50e6;
async function usingFilePair(task) {
    return temp(async (a) => temp(async (b) => await task(a, b)));
}
function trim(out) {
    return out.substring((0, lodash_1.indexOf)(out, "{"), (0, lodash_1.lastIndexOf)(out, "}") + 1);
}
function validateInstances(instances) {
    const filtered = (0, lodash_1.filter)(instances, ({ start, end }) => ![start, end].includes(undefined));
    return filtered.length ? filtered : undefined;
}
exports.solve = [
    /**
     * Returns a pathfinding solution.
     */
    (0, createMethod_1.createMethod)("solve/pathfinding", ({ algorithm, format, mapURI, instances: inst }) => usingFilePair(async (scenarioPath, mapPath) => {
        if (algorithm) {
            const { create, invoke } = scenario_1.handlers[format];
            const { scheme, content } = (0, map_1.parseURI)(mapURI);
            // Check if URI scheme is trace,
            // if so, return the URI content
            if (scheme !== "trace:") {
                const m = (0, map_1.getMap)(mapURI);
                // Check if the URI references a valid map
                if (m) {
                    const instances = validateInstances(inst);
                    // Check if there are any instances to solve
                    if (instances) {
                        const scenario = create(m, { instances });
                        await Promise.all([
                            (0, promises_1.writeFile)(scenarioPath, scenario(mapPath), "utf-8"),
                            (0, promises_1.writeFile)(mapPath, m, "utf-8"),
                        ]);
                        const output = await invoke(algorithm, scenarioPath, mapPath);
                        if (output.length > exports.MAX_SOLUTION_SIZE) {
                            throw new Error("Solution is too large.");
                        }
                        return JSON.parse(trim(output));
                    }
                    else
                        throw new Error("Nothing to solve.");
                }
            }
            else
                return JSON.parse(content);
        }
        else
            throw new Error("Select an algorithm.");
    })),
];
//# sourceMappingURL=solve.js.map