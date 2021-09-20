import { Stage } from "@inlet/react-pixi";
import { Box, useTheme } from "@material-ui/core";
import { Point, RendererProps } from "components/specimen-inspector/Renderer";
import { delay, floor, take } from "lodash";
import { ComponentProps, useCallback, useMemo, useState } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { getColor } from "./colors";
import { scale, size } from "./config";
import { getSelectionInfo } from "./getSelectionInfo";
import { Guides } from "./Guides";
import { square } from "./Node";
import { NodeList } from "./NodeList";
import { parseMap } from "./parseMap";
import { ViewportEvent } from "./PixiViewport";
import { Selection } from "./Selection";
import { Viewport } from "./Viewport";

type GridRendererProps = RendererProps &
  Omit<ComponentProps<typeof Stage>, "onSelect">;

function getPoint({ x, y }: Point) {
  return { x: floor(x / scale) - 1, y: floor(y / scale) - 1 };
}

export function GridRenderer({
  onSelect,
  selection,
  ...props
}: GridRendererProps) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const { width = 0, height = 0 } = props;
  const [{ specimen, mapURI }] = useSpecimen();
  const [{ step = 0 }] = useUIState();
  const { palette } = useTheme();

  const [active, setActive] = useState<Point | undefined>(undefined);
  const [hover, setHover] = useState<Point | undefined>(undefined);

  const nodes = useMemo(
    () => take(specimen?.eventList, step + 1),
    [specimen, step]
  );

  const [bgNodes, bgNodeColor] = useMemo(
    () => [parseMap(mapURI), () => 0x121212] as const,
    [mapURI]
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
          <Selection hover={hover} highlight={selection || active} />
          <Guides
            width={size * scale}
            height={size * scale}
            x={0}
            y={0}
            alpha={palette.action.disabledOpacity}
          />
          <NodeList nodes={bgNodes} color={bgNodeColor} variant={square} />
          <NodeList nodes={specimen?.eventList} variant={square} />
          <NodeList nodes={nodes} color={getColor} />
        </Viewport>
      </Stage>
    </Box>
  );
}
