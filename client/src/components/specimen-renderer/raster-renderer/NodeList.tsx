import { Graphics } from "@inlet/react-pixi";
import { constant, filter, floor, memoize, slice } from "lodash";
import * as PIXI from "pixi.js";
import { Trace, TraceEventType } from "protocol/Trace";
import { useCallback, useMemo } from "react";
import { box, coerce, NodeProps } from "./Node";

type Props = {
  nodes: Trace["eventList"];
  color?: (type?: TraceEventType) => number;
  variant?: (g: PIXI.Graphics, options: NodeProps) => PIXI.Graphics;
  resolution?: number;
  condition?: (step: number) => boolean;
};

const defaultCondition = constant(true);

export function NodeList({
  nodes,
  color,
  variant = box,
  resolution = 1,
  condition = defaultCondition,
}: Props) {
  const memo = useMemo(
    () => filter(nodes, (_, i) => condition(i)),
    [nodes, condition]
  );
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      for (const { variables: v, type } of memo) {
        variant(g, {
          ...coerce(v),
          color: color?.(type) ?? 0xf1f1f1,
          radius: 0.25,
          resolution,
        });
      }
      return g;
    },
    [memo, color, resolution, variant]
  );
  return <Graphics draw={draw} />;
}

const down = (n: number, a: number = 1) => floor(n / a) * a;

export function LazyNodeList({
  nodes,
  step = 0,
  size = 2500,
  condition,
  ...props
}: {
  step?: number;
  size?: number;
} & Props) {
  const threshold = down(step, size);

  const chunk = useMemo(
    () => memoize((n: number) => slice(nodes, 0, n)),
    [nodes]
  );

  const c = useCallback(
    (n: number) => condition?.(n + threshold) ?? true,
    [condition, threshold]
  );

  return (
    <>
      <NodeList {...props} nodes={chunk(threshold)} condition={condition} />
      <NodeList
        {...props}
        nodes={slice(nodes, threshold, step + 1)}
        condition={c}
      />
    </>
  );
}
