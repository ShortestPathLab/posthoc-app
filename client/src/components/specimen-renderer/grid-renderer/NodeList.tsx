import { Graphics } from "@inlet/react-pixi";
import { keyBy, values } from "lodash";
import * as PIXI from "pixi.js";
import { Trace, TraceEventType } from "protocol/Trace";
import { useCallback, useMemo } from "react";
import { scale } from "./config";
import { point, NodeProps } from "./Node";

type Props = {
  nodes: Trace["eventList"];
  color?: (type?: TraceEventType) => number;
  variant?: (g: PIXI.Graphics, options: NodeProps) => PIXI.Graphics;
  resolution?: number;
};

export function NodeList({
  nodes,
  color,
  variant = point,
  resolution = 0.15,
}: Props) {
  const memo = useMemo(
    () =>
      values(keyBy(nodes, ({ variables: v }) => `${v?.x ?? 0}::${v?.y ?? 0}`)),
    [nodes]
  );
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      for (const { variables: v, type } of memo) {
        variant(g, {
          color: color?.(type) ?? 0xe0e0e0,
          left: (v?.x ?? 0) * scale,
          top: (v?.y ?? 0) * scale,
          radius: 0.25,
          resolution,
        });
      }
      return g;
    },
    [memo, color, resolution, variant]
  );
  return <Graphics draw={draw} scale={1 / resolution} />;
}
