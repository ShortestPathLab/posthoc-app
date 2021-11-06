import { Graphics } from "@inlet/react-pixi";
import { chain, constant, floor, memoize, slice } from "lodash";
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
  condition?: (step: number) => boolean;
};

const defaultCondition = constant(true);

export function NodeList({
  nodes,
  color,
  variant = box,
  resolution = 1 / scale,
  condition = defaultCondition,
}: Props) {
  const memo = useMemo(
    () =>
      chain(nodes)
        .filter((_, i) => condition(i))
        .keyBy(({ variables: v }) => `${v?.x ?? 0}::${v?.y ?? 0}`)
        .values()
        .value(),
    [nodes, condition]
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

  const chunk = useCallback(
    memoize((n: number) => slice(nodes, 0, n)),
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
