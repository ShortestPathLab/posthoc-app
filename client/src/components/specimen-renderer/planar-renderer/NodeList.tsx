import { Graphics } from "@inlet/react-pixi";
import { constant, filter, floor, memoize, slice } from "lodash";
import * as PIXI from "pixi.js";
import { Trace, TraceEventType } from "protocol/Trace";
import { useCallback, useMemo } from "react";
import { Transform } from "../Transform";
import { coerce } from "../Node";
import { Point } from "../Renderer";
import { box, NodeOptions } from "./Draw";

type Props = {
  nodes: Trace["eventList"];
  color?: (type?: TraceEventType) => number;
  variant?: (g: PIXI.Graphics, options: NodeOptions) => PIXI.Graphics;
  condition?: (step: number) => boolean;
  transform: Transform<Point>;
  options?: NodeOptions;
};

const defaultCondition = constant(true);

export function NodeList({
  nodes,
  color,
  variant = box,
  condition = defaultCondition,
  options,
  transform: { to },
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
          ...coerce(v, to),
          color: color?.(type) ?? 0xf1f1f1,
          ...options,
        });
      }
      return g;
    },
    [memo, color, variant, options, to]
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
