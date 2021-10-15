import { Graphics } from "@inlet/react-pixi";
import { floor, keyBy, memoize, slice, values } from "lodash";
import * as PIXI from "pixi.js";
import { Trace, TraceEventType } from "protocol/Trace";
import { useCallback, useMemo } from "react";
import { scale } from "./config";
import { box, NodeProps } from "./Node";

type Props = {
  nodes: Trace["eventList"];
  color?: (type?: TraceEventType) => number;
  variant?: (g: PIXI.Graphics, options: NodeProps) => PIXI.Graphics;
  resolution?: number;
};

export function NodeList({
  nodes,
  color,
  variant = box,
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
          color: color?.(type) ?? 0xf6f6f6,
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

function down(n: number, a: number = 1) {
  return floor(n / a) * a;
}

export function LazyNodeList({
  nodes,
  step = 0,
  size = 5000,
  ...props
}: {
  step?: number;
  size?: number;
} & Props) {
  const chunk = useCallback(
    memoize((n: number) => slice(nodes, 0, n)),
    [nodes]
  );
  return (
    <>
      <NodeList nodes={chunk(down(step, size))} {...props} />
      <NodeList nodes={slice(nodes, down(step, size), step + 1)} {...props} />
    </>
  );
}
