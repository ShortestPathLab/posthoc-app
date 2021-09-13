import { Container, Stage } from "@inlet/react-pixi";
import { useTheme } from "@material-ui/core";
import { keyBy, map, take, values } from "lodash";
import { ComponentProps, useMemo } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { Trace, TraceEventType } from "protocol/Trace";
import { getColor } from "./colors";
import { SCALE, SIZE } from "./constants";
import { Grid } from "./Grid";
import { Node } from "./Node";
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
  return (
    <Container>
      {map(values(memo), ({ variables, type }, i) => (
        <Node
          key={i}
          x={(variables?.x ?? 0) * SCALE}
          y={(variables?.y ?? 0) * SCALE}
          color={color?.(type) ?? 0xe0e0e0}
        />
      ))}
    </Container>
  );
}

type RendererProps = {} & ComponentProps<typeof Stage>;

export function Renderer(props: RendererProps) {
  const { width = 0, height = 0 } = props;
  const [specimen] = useSpecimen();
  const [{ step = 0 }] = useUIState();
  const { palette } = useTheme();

  return (
    <Stage
      options={{
        backgroundAlpha: 0,
        antialias: true,
      }}
      {...props}
    >
      <Viewport width={width} height={height}>
        <Container>
          <NodeList nodes={specimen?.eventList} />
          <NodeList nodes={take(specimen?.eventList, step)} color={getColor} />
        </Container>
        <Grid
          width={SIZE * SCALE}
          height={SIZE * SCALE}
          x={(-SIZE / 2) * SCALE}
          y={(-SIZE / 2) * SCALE}
          alpha={palette.action.disabledOpacity}
        />
      </Viewport>
    </Stage>
  );
}
