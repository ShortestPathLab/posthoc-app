import { Graphics } from "@inlet/react-pixi";
import { keyBy, values } from "lodash";
import * as PIXI from "pixi.js";
import { Trace, TraceEventType } from "protocol/Trace";
import { useCallback, useMemo } from "react";
import { SCALE } from "./constants";
import { drawNode } from "./Node";

export function NodeList({
  nodes,
  color,
}: {
  nodes: Trace["eventList"];
  color?: (type?: TraceEventType) => number;
}) {
  const memo = useMemo(
    () =>
      values(keyBy(nodes, ({ variables: v }) => `${v?.x ?? 0}::${v?.y ?? 0}`)),
    [nodes]
  );
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      for (const { variables: v, type } of memo) {
        drawNode(g, {
          color: color?.(type) ?? 0xe0e0e0,
          left: (v?.x ?? 0) * SCALE,
          top: (v?.y ?? 0) * SCALE,
        });
      }
      return g;
    },
    [memo, color]
  );
  return <Graphics draw={draw} />;
}
