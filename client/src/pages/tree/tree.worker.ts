import { graphlib, layout } from "@dagrejs/dagre";
import { Dictionary, forEach, pick } from "lodash";
import { Trace, TraceEvent } from "protocol";
import { usingMessageHandler } from "../../workers/usingWorker";

export function getFinalParents(trace: Trace | undefined) {
  const finalParent: Dictionary<Key> = {};
  forEach(trace?.events, ({ id, pId }) => {
    finalParent[id] = pId;
  });
  return finalParent;
}

export type EventTree = {
  id: Key;
  name: string;
  children?: EventTree[];
  cumulativeChildCount: number;
  events: { data: TraceEvent; step: number; pId: Key; id: Key }[];
  pId: Key;
  parent?: EventTree;
};

export type Key = string | number | null | undefined;

function parse({ trace, mode, orientation }: TreeWorkerParameters) {
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
        const finalParent: Dictionary<Key> = getFinalParents(trace);

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
            const parent = finalParent[id];
            if (parent) {
              if (g.hasNode(`${parent}`)) {
                g.setEdge(`${id}`, `${parent}`, {
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
  g.setGraph({
    ranksep: 100,
    align: "UL",
    rankdir: orientation === "horizontal" ? "LR" : "TB",
  });
  layout(g);
  return g.nodes().map((node) => pick(g.node(node), "x", "y", "label", "size"));
}
export type TreeWorkerParameters = {
  trace?: Trace;
  step?: number;
  mode?: "tree" | "directed-graph";
  orientation?: "horizontal" | "vertical";
};

export type TreeWorkerReturnType =
  | { x: number; y: number; label: string; size: number }[]
  | undefined;

onmessage = usingMessageHandler(
  async ({ data }: MessageEvent<TreeWorkerParameters>) => parse(data)
);
