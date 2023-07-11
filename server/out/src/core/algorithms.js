"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.algorithms = void 0;
const lodash_1 = require("lodash");
exports.algorithms = (0, lodash_1.mapValues)({
    dijkstra: { name: "Dijkstra" },
    cbs_ll: { name: "Conflict-based Search" },
    cbs_ll_w: { name: undefined },
    astar: { name: "A* Search" },
    astar_wgm: { name: undefined },
    astar4c: { name: undefined },
    sssp: { name: "Single Source Shortest Path" },
    sipp: { name: undefined },
    jps: { name: "Jump Point Search" },
    jps2: { name: "Jump Point Search 2" },
    "jps2+": { name: "Jump Point Search 2+" },
    jps4c: { name: undefined },
    gdfs: { name: undefined },
    dfs: { name: "Depth-first Search" },
}, ({ name }, k) => ({ name: name ?? (0, lodash_1.startCase)(k) }));
//# sourceMappingURL=algorithms.js.map