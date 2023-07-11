"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMap = exports.parseURI = void 0;
const lru_cache_1 = __importDefault(require("lru-cache"));
const md5_1 = __importDefault(require("md5"));
const process_1 = require("process");
const url_1 = require("url");
/**
 * Specifies the maximum amount of maps that can be cached at a given time.
 * @default 500e6
 */
const CACHE_SIZE = process_1.env.CACHE_SIZE ? +process_1.env.CACHE_SIZE : 500e6;
const cache = new lru_cache_1.default({ max: CACHE_SIZE });
function parseURI(uri) {
    const { protocol, pathname } = new url_1.URL(uri);
    return {
        scheme: protocol,
        content: decodeURIComponent(pathname),
    };
}
exports.parseURI = parseURI;
function getMap(uri) {
    const { scheme, content } = parseURI(uri);
    switch (scheme) {
        case "map:":
            cache.set((0, md5_1.default)(content), content);
            return content;
        case "hash:":
            return cache.get(content);
    }
}
exports.getMap = getMap;
//# sourceMappingURL=map.js.map