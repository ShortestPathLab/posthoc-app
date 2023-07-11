"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMapDescriptor = exports.mapIsSupported = exports.mapsPath = void 0;
const lodash_1 = require("lodash");
const path_1 = require("path");
const scenario_1 = require("./scenario");
exports.mapsPath = "./static/maps";
function mapIsSupported(path) {
    return (0, lodash_1.some)((0, lodash_1.keys)(scenario_1.handlers), (t) => path.endsWith(`.${t}`));
}
exports.mapIsSupported = mapIsSupported;
function getMapDescriptor(path) {
    const file = (0, path_1.parse)(path);
    return {
        id: (0, path_1.relative)((0, path_1.resolve)(exports.mapsPath), path),
        name: file.name,
        format: file.ext.slice(1),
        description: (0, path_1.relative)((0, path_1.resolve)(exports.mapsPath), path),
    };
}
exports.getMapDescriptor = getMapDescriptor;
//# sourceMappingURL=maps.js.map