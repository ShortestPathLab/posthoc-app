import { Stage } from "@inlet/react-pixi";
import { Box } from "@material-ui/core";
import { Point, RendererProps } from "components/specimen-renderer/Renderer";
import { delay, floor, map, merge, take } from "lodash";
import { ComponentProps, useMemo, useState } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { getColor } from "./colors";
import { scale } from "./config";
import { getDefaults } from "./getDefaults";
import { Guides } from "./Guides";
import { Node, square } from "./Node";
import { NodeList } from "./NodeList";
import { parseMap } from "./parseMap";
import { ViewportEvent } from "./PixiViewport";
import { Selection } from "./Selection";
import { selectionInfo } from "./selectionInfo";
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
  const [{ step = 0, ...state }] = useUIState();

  const [active, setActive] = useState<Point | undefined>(undefined);
  const [hover, setHover] = useState<Point | undefined>(undefined);

  const nodes = useMemo(
    () => take(specimen?.eventList, step + 1),
    [specimen, step]
  );

  const [size, bgNodes, , bgNodeColor, { start, end }] = useMemo(
    () =>
      [
        ...parseMap(mapURI),
        () => 0x121212,
        merge(getDefaults(mapURI), state),
      ] as const,
    [mapURI, state.start, state.end]
  );

  const handleClick = useMemo(() => {
    const info = selectionInfo(mapURI, specimen, step);
    return ({ global, world }: ViewportEvent) => {
      if (ref && specimen) {
        const { top, left } = ref.getBoundingClientRect();
        const point = getPoint(world);
        onSelect?.({
          global: { x: left + global.x, y: top + global.y },
          world: point,
          info: info(point),
        });
      }
    };
  }, [ref, onSelect, specimen, step, mapURI]);

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
          <Guides width={size.x} height={size.y} alpha={0.56} grid={10} />
          <Guides width={size.x} height={size.y} alpha={0.24} grid={1} />
          <NodeList nodes={specimen?.eventList} variant={square} />
          <NodeList nodes={bgNodes} color={bgNodeColor} variant={square} />
          <Overlay start={start} end={end} size={size} />
          <NodeList nodes={nodes} color={getColor} />
        </Viewport>
      </Stage>
    </Box>
  );
}

type OverlayProps = {
  start?: number;
  end?: number;
  size?: Point;
};

function Overlay({
  start: start = 0,
  end: end = 0,
  size = { x: 0, y: 0 },
}: OverlayProps) {
  return (
    <>
      {map(
        [
          { color: getColor("source"), node: start },
          { color: getColor("destination"), node: end },
        ],
        ({ color, node }, i) => (
          <Node
            key={i}
            x={scale * (node % size.x)}
            y={scale * floor(node / size.x)}
            color={color}
            alpha={0.25}
          />
        )
      )}
    </>
  );
}
