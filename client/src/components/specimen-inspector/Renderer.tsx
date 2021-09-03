import { Container, Stage } from "@inlet/react-pixi";
import { useTheme } from "@material-ui/core";
import { map, take } from "lodash";
import { ComponentProps } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { Trace, TraceEventType } from "../../../../protocol/Trace";
import { getColor } from "./colors";
import { SCALE, SIZE } from "./constants";
import { Grid } from "./Grid";
import { Node } from "./Node";
import Viewport from "./Viewport";

type RendererProps = {} & ComponentProps<typeof Stage>;

export function Renderer(props: RendererProps) {
  const [specimen] = useSpecimen();
  const [{ step = 0 }] = useUIState();
  const { width = 0, height = 0 } = props;
  const { palette } = useTheme();
  function renderNodes(
    nodes: Trace["eventList"],
    color: (type?: TraceEventType) => number
  ) {
    return (
      <Container>
        {map(nodes, ({ variables, type }, i) => (
          <Node
            key={i}
            x={(variables?.x ?? 0) * SCALE}
            y={(variables?.y ?? 0) * SCALE}
            color={color(type)}
          />
        ))}
      </Container>
    );
  }
  return (
    <Stage
      key={`${width}.${height}`}
      options={{
        backgroundAlpha: 0,
        antialias: true,
      }}
      {...props}
    >
      <Viewport width={width} height={height}>
        <Container>
          {renderNodes(specimen?.eventList, () => 0xe0e0e0)}
          {renderNodes(take(specimen?.eventList, step), getColor)}
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
