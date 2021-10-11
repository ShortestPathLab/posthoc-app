import { Graphics } from "@inlet/react-pixi";
import { Graphics as PixiGraphics } from "@pixi/graphics";
import { isNull, isUndefined, keyBy } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { useMemo } from "react";
import { scale } from "./config";
import { deepPurple } from "@material-ui/core/colors";
import { convert } from "./colors";

const stroke = convert(deepPurple["500"]);

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
      for (const node of p) {
        const { x = 0, y = 0 } = node?.variables ?? {};
        g.lineTo(x * scale, y * scale);
        g.lineStyle(1, stroke);
      }
    };
  }, [path, step]);

  return <Graphics draw={draw} />;
}
