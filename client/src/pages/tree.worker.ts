import { graphlib, layout } from "dagre";
import { Dictionary, forEach, forEachRight, pick, reverse, set } from "lodash";
import { Trace, TraceEvent } from "protocol";

export type EventTree = {
  id: Key;
  name: string;
  children?: EventTree[];
  cumulativeChildCount: number;
  events: { data: TraceEvent; step: number; pId: Key; id: Key }[];
  pId: Key;
  parent?: EventTree;
};

type Key = string | number | null | undefined;

function parse({ trace, mode }: TreeWorkerParameters) {
  const g = new graphlib.Graph<{ size: number }>();

  // Set an object for the graph label
  g.setGraph({});
  switch (mode) {
    case "directed-graph":
      forEach(trace?.events, ({ id, pId, type }, i) => {
        if (id) {
          if (!g.hasNode(`${id}`)) {
            g.setNode(`${id}`, {
              label: `${id}`,
              width: 1,
              height: 1,
              size: 1,
            });
          } else {
            g.node(`${id}`).size += 1;
          }
          if (pId) {
            if (g.hasNode(`${pId}`)) {
              g.setEdge(`${id}`, `${pId}`, {
                label: `${id}`,
                width: 1,
                height: 1,
              });
            }
          }
        }
      });
      break;

    case "tree":
      {
        const numParents: Dictionary<Set<string | number>> = {};
        forEach(trace?.events, ({ id, pId, type }, i) => {
          if (id && pId) {
            numParents[id] = numParents[id] ?? new Set();
            numParents[id].add(pId);
          }
        });

        forEach(trace?.events, ({ id, pId, type }, i) => {
          if (id) {
            if (!g.hasNode(`${id}`)) {
              g.setNode(`${id}`, {
                label: `${id}`,
                width: 1,
                height: 1,
                size: 1,
              });
            } else {
              g.node(`${id}`).size += 1;
            }
            if (pId && numParents[id].size <= 1) {
              if (g.hasNode(`${pId}`)) {
                g.setEdge(`${id}`, `${pId}`, {
                  label: `${id}`,
                  width: 1,
                  height: 1,
                });
              }
            }
          }
        });
      }
      break;
  }
  layout(g, { align: "U" });
  return g.nodes().map((node) => pick(g.node(node), "x", "y", "label", "size"));
}
export type TreeWorkerParameters = {
  trace?: Trace;
  step?: number;
  mode?: "tree" | "directed-graph";
};

export type TreeWorkerReturnType =
  | { x: number; y: number; label: string; size: number }[]
  | undefined;

onmessage = ({ data }: MessageEvent<TreeWorkerParameters>) => {
  postMessage(parse(data));
};
