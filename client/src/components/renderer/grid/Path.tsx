import { Graphics } from "@inlet/react-pixi";
import { Graphics as PixiGraphics } from "@pixi/graphics";
import { isNull, isUndefined, keyBy, range } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { useMemo } from "react";
import { getColor } from "../colors";
import { scale } from "../raster/config";
import { Square } from "../raster/Draw";
import { Scale } from "../Size";

const WEIGHT = 3 / scale;

function defined<T>(obj: T): obj is Exclude<T, undefined | null> {
  return !isUndefined(obj) && !isNull(obj);
}

type PathProps = {
  nodes?: TraceEvent<"x" | "y">[];
  step?: number;
  scale: Scale;
};

export function Path({ nodes = [], step = 0, scale: { to } }: PathProps) {
  const path = useMemo(() => {
    const memo = range(nodes.length).map((i) => keyBy(nodes.slice(0, i), "id"));
    return (s: number) => {
      const out = [];
      let next: TraceEvent | undefined = nodes[s];
      while (next) {
        out.push(next);
        next = defined(next.pId) ? memo[s][`${next.pId}`] : undefined;
      }
      return out;
    };
  }, [nodes]);

  const draw = useMemo(() => {
    const p = path(step);
    return (g: PixiGraphics) => {
      g.clear();
      for (const [i, node] of p.entries()) {
        const { x, y } = to({ x: 0, y: 0, ...node?.variables });
        g.lineTo(x, y);
        if (!i) g.lineStyle(WEIGHT, getColor("source"));
      }
    };
  }, [path, step, to]);

  const point = to({ x: 0, y: 0, ...nodes[step]?.variables });

  return (
    <>
      <Graphics draw={draw} />
      {nodes?.[step] && <Square {...point} color={getColor("source")} />}
    </>
  );
}
