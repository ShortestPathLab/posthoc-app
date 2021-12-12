import { Graphics } from "@inlet/react-pixi";
import { constant, filter, floor, identity, memoize, slice } from "lodash";
import * as PIXI from "pixi.js";
import { Trace } from "protocol/Trace";
import { useCallback, useMemo } from "react";
import { Point } from "../Renderer";
import { Scale } from "../Scale";
import { box, NodeOptions, NodeOptionsMapper } from "./Draw";

export type Props<T extends string> = {
  nodes?: Trace<T>["eventList"];
  variant?: (g: PIXI.Graphics, options: NodeOptions) => PIXI.Graphics;
  condition?: (step: number) => boolean;
  scale?: Scale<Point>;
  options?: NodeOptionsMapper<T>;
};

const defaultCondition = constant(true);

export function NodeList<T extends string>({
  nodes,
  variant = box,
  condition = defaultCondition,
  scale,
  options = identity,
}: Props<T>) {
  const memo = useMemo(
    () => filter(nodes, (_, i) => condition(i)),
    [nodes, condition]
  );
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      for (const s of memo) variant(g, options(s, scale));
      return g;
    },
    [memo, variant, scale, options]
  );
  return <Graphics draw={draw} />;
}

const down = (n: number, a: number = 1) => floor(n / a) * a;

export function LazyNodeList<T extends string>({
  nodes,
  step = 0,
  size = 2500,
  condition,
  ...props
}: {
  step?: number;
  size?: number;
} & Props<T>) {
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
