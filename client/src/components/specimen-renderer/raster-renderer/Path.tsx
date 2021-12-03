import { Graphics } from "@inlet/react-pixi";
import { Graphics as PixiGraphics } from "@pixi/graphics";
import { isNull, isUndefined, keyBy } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { useMemo } from "react";
import { getColor } from "../colors";
import { scale } from "./config";
import { Square } from "./Draw";

const WEIGHT = 3 / scale;

function defined<T>(obj: T): obj is Exclude<T, undefined | null> {
  return !isUndefined(obj) && !isNull(obj);
}

type PathProps = {
  nodes?: TraceEvent[];
  step?: number;
};

export function Path({ nodes = [], step = 0 }: PathProps) {
  const path = useMemo(() => {
    const memo = keyBy(nodes, "id");
    return (s: number) => {
      const out = [];
      let next: TraceEvent | undefined = nodes[s];
      while (next) {
        out.push(next);
        next = defined(next.pId) ? memo[`${next.pId}`] : undefined;
      }
      return out;
    };
  }, [nodes]);

  const draw = useMemo(() => {
    const p = path(step);
    return (g: PixiGraphics) => {
      g.clear();
      for (const [i, node] of p.entries()) {
        const { x = 0, y = 0 } = node?.variables ?? {};
        g.lineTo(x + 0.5, y + 0.5);
        if (!i) g.lineStyle(WEIGHT, getColor("source"));
      }
    };
  }, [path, step]);

  return (
    <>
      <Graphics draw={draw} />
      <Square
        x={0.5 + (nodes?.[step]?.variables?.x ?? 0)}
        y={0.5 + (nodes?.[step]?.variables?.y ?? 0)}
        color={getColor("source")}
      />
    </>
  );
}
