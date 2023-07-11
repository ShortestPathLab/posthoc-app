"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.features = void 0;
const promises_1 = require("fs/promises");
const glob_promise_1 = __importDefault(require("glob-promise"));
const lodash_1 = require("lodash");
const path_1 = require("path");
const algorithms_1 = require("../core/algorithms");
const maps_1 = require("../core/maps");
const scenario_1 = require("../core/scenario");
const createMethod_1 = require("./createMethod");
async function getFiles(path) {
    return await (0, glob_promise_1.default)(`${(0, path_1.resolve)(path)}/**/*`);
}
exports.features = [
    /**
     * Returns supported algorithms.
     */
    (0, createMethod_1.createMethod)("features/algorithms", (0, lodash_1.memoize)(async () => {
        return (0, lodash_1.map)((0, lodash_1.entries)(algorithms_1.algorithms), ([f, { name }]) => ({
            id: f,
            name: name,
            description: f,
        }));
    })),
    /**
     * Returns supported map types.
     */
    (0, createMethod_1.createMethod)("features/formats", (0, lodash_1.memoize)(async () => (0, lodash_1.map)((0, lodash_1.keys)(scenario_1.handlers), (t) => ({
        id: t,
        name: (0, lodash_1.startCase)(t),
        description: t,
    })))),
    /**
     * Returns template map descriptors.
     */
    (0, createMethod_1.createMethod)("features/maps", (0, lodash_1.memoize)(async () => {
        const maps = (0, lodash_1.filter)(await getFiles(maps_1.mapsPath), maps_1.mapIsSupported);
        return (0, lodash_1.map)(maps, maps_1.getMapDescriptor);
    })),
    /**
     * Returns a particular map.
     */
    (0, createMethod_1.createMethod)("features/map", (0, lodash_1.memoize)(async ({ id }) => {
        const map = (0, lodash_1.first)(await (0, glob_promise_1.default)((0, path_1.resolve)(maps_1.mapsPath, id)));
        return map
            ? {
                ...(0, maps_1.getMapDescriptor)(map),
                content: await (0, promises_1.readFile)(map, "utf8"),
            }
            : undefined;
    }, ({ id }) => id)),
];
//# sourceMappingURL=features.js.map