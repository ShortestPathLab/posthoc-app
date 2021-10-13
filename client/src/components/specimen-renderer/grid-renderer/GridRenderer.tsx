import { Stage } from "@inlet/react-pixi";
import { Box } from "@material-ui/core";
import { Point, RendererProps } from "components/specimen-renderer/Renderer";
import { delay, floor, merge, take } from "lodash";
import { ComponentProps, useMemo, useState } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { getColor } from "./colors";
import { scale } from "./config";
import { getDefaults } from "./getDefaults";
import { Guides } from "./Guides";
import { square, box } from "./Node";
import { NodeList } from "./NodeList";
import { Overlay } from "./Overlay";
import { parseMap } from "./parseMap";
import { Path } from "./Path";
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
  const [{ specimen, map: m }] = useSpecimen();
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
        ...parseMap(m),
        () => 0xe1e1e1,
        merge(getDefaults(m), { start: state.start, end: state.end }),
      ] as const,
    [m, state.start, state.end]
  );

  const handleClick = useMemo(() => {
    const info = selectionInfo(m, specimen, step);
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
  }, [ref, onSelect, specimen, step, m]);

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
          <NodeList nodes={specimen?.eventList} variant={square} />
          <NodeList nodes={bgNodes} color={bgNodeColor} variant={box} />
          <Overlay start={start} end={end} size={size} />
          <NodeList nodes={nodes} color={getColor} />
          <Path nodes={specimen?.eventList} step={step} />
          <Guides width={size.x} height={size.y} alpha={0.56} grid={10} />
          <Guides width={size.x} height={size.y} alpha={0.24} grid={1} />
        </Viewport>
      </Stage>
    </Box>
  );
}