import { Graphics, Stage } from "@inlet/react-pixi";
import { useTheme } from "@material-ui/core";
import { keyBy, take, values } from "lodash";
import * as PIXI from "pixi.js";
import { Trace, TraceEventType } from "protocol/Trace";
import { ComponentProps, useCallback, useMemo } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { getColor } from "./colors";
import { SCALE, SIZE } from "./constants";
import { Grid } from "./Grid";
import { drawNode } from "./Node";
import Viewport from "./Viewport";

function NodeList({
  nodes,
  color,
}: {
  nodes: Trace["eventList"];
  color?: (type?: TraceEventType) => number;
}) {
  const memo = useMemo(
    () =>
      values(
        keyBy(nodes, ({ variables: { x = 0, y = 0 } = {} }) => `${x}::${y}`)
      ),
    [nodes]
  );
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      for (const { variables, type } of memo) {
        drawNode(g, {
          color: color?.(type) ?? 0xe0e0e0,
          x: (variables?.x ?? 0) * SCALE,
          y: (variables?.y ?? 0) * SCALE,
        });
      }
      return g;
    },
    [memo, color]
  );
  return <Graphics draw={draw} />;
}

type RendererProps = {} & ComponentProps<typeof Stage>;

export function Renderer(props: RendererProps) {
  const { width = 0, height = 0 } = props;
  const [specimen] = useSpecimen();
  const [{ step = 0 }] = useUIState();
  const { palette } = useTheme();

  const nodes = useMemo(
    () => take(specimen?.eventList, step),
    [specimen, step]
  );

  return (
    <Stage
      options={{
        backgroundColor: 0xffffff,
      }}
      {...props}
    >
      <Viewport width={width} height={height}>
        <NodeList nodes={specimen?.eventList} />
        <NodeList nodes={nodes} color={getColor} />
        <Grid
          width={SIZE * SCALE}
          height={SIZE * SCALE}
          x={0}
          y={0}
          alpha={palette.action.disabledOpacity}
        />
      </Viewport>
    </Stage>
  );
}
