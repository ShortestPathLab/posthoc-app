import { Stage } from "@inlet/react-pixi";
import { Box, useTheme } from "@material-ui/core";
import { delay, floor, map, take } from "lodash";
import { ComponentProps, useCallback, useMemo, useState } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { getColor } from "./colors";
import { SCALE, SIZE } from "./constants";
import { getSelectionInfo, SelectionInfo } from "./getSelectionInfo";
import { Grid } from "./Grid";
import { NodeList } from "./NodeList";
import { NodeSelection as Node } from "./NodeSelection";
import { ViewportEvent } from "./PixiViewport";
import Viewport from "./Viewport";

export type Point = {
  x: number;
  y: number;
};

export type SelectEvent = {
  global: Point;
  world: Point;
  info: SelectionInfo;
};

type RendererProps = {
  onSelect?: (e: SelectEvent) => void;
  selection?: Point;
} & Omit<ComponentProps<typeof Stage>, "onSelect">;

function getPoint({ x, y }: Point) {
  return { x: floor(x / SCALE) - 1, y: floor(y / SCALE) - 1 };
}

export function Renderer({ onSelect, selection, ...props }: RendererProps) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const { width = 0, height = 0 } = props;
  const [specimen] = useSpecimen();
  const [{ step = 0 }] = useUIState();
  const { palette } = useTheme();

  const [active, setActive] = useState<Point | undefined>(undefined);
  const [hover, setHover] = useState<Point | undefined>(undefined);

  const nodes = useMemo(
    () => take(specimen?.eventList, step + 1),
    [specimen, step]
  );

  const handleClick = useCallback(
    ({ global, world }: ViewportEvent) => {
      if (ref && specimen) {
        const { top, left } = ref.getBoundingClientRect();
        const point = getPoint(world);
        onSelect?.({
          global: { x: left + global.x, y: top + global.y },
          world: point,
          info: getSelectionInfo(point, specimen, step),
        });
      }
    },
    [ref, onSelect, specimen, step]
  );

  const handleMouseEvent = useMemo(() => {
    let timeout = 0;
    return ({ world, event }: ViewportEvent) => {
      switch (event) {
        case "onMouseOver":
          setHover(getPoint(world));
          setActive(undefined);
          clearTimeout(timeout);
          break;
        case "onMouseDown":
          timeout = delay(() => setActive(getPoint(world)), 100);
          break;
      }
    };
  }, [setHover]);

  const highlight = selection || active;

  return (
    <Box sx={{ cursor: "pointer" }} ref={setRef}>
      <Stage options={{ backgroundColor: 0xffffff }} {...props}>
        <Viewport
          width={width}
          height={height}
          onClick={handleClick}
          onMouseDown={handleMouseEvent}
          onMouseOver={handleMouseEvent}
        >
          {map(
            [
              { point: hover, color: 0xf9f9f9, animateAlpha: true },
              { point: highlight, color: 0xf1f1f1, animateScale: true },
            ],
            ({ point, ...props }, i) =>
              point && (
                <Node
                  key={`${i}::${point.x}::${point.y}`}
                  x={point.x * SCALE}
                  y={point.y * SCALE}
                  {...props}
                />
              )
          )}
          <Grid
            width={SIZE * SCALE}
            height={SIZE * SCALE}
            x={0}
            y={0}
            alpha={palette.action.disabledOpacity}
          />
          <NodeList nodes={specimen?.eventList} />
          <NodeList nodes={nodes} color={getColor} />
        </Viewport>
      </Stage>
    </Box>
  );
}
