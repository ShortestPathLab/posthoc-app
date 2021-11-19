import { Stage } from "@inlet/react-pixi";
import { blueGrey } from "@material-ui/core/colors";
import { call } from "components/script-editor/call";
import { Point, RendererProps } from "components/specimen-renderer/Renderer";
import { constant, delay, floor, memoize, merge, once } from "lodash";
import { ComponentProps, useMemo, useState } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { getColor, hex } from "../colors";
import { scale } from "../raster-renderer/config";
import { Guides } from "../raster-renderer/Guides";
import {
  LazyNodeList as LazyNodes,
  NodeList as Nodes,
} from "../raster-renderer/NodeList";
import { Overlay } from "../raster-renderer/Overlay";
import { Path } from "../raster-renderer/Path";
import { ViewportEvent } from "../raster-renderer/PixiViewport";
import { RasterRenderer } from "../raster-renderer/RasterRenderer";
import { getDefaults } from "./getDefaults";
import { parseMap } from "./parseMap";
import { Selection } from "./Selection";
import { selectionInfo } from "./selectionInfo";

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
  const [{ specimen, map: m }] = useSpecimen();
  const [{ step = 0, code, ...state }] = useUIState();

  const [active, setActive] = useState<Point | undefined>(undefined);
  const [hover, setHover] = useState<Point | undefined>(undefined);

  const [[size, bgNodes], bgNodeColor, { start, end }] = useMemo(
    () =>
      [
        parseMap(m),
        once(() => hex(blueGrey["500"])),
        merge(getDefaults(m), { start: state.start, end: state.end }),
      ] as const,
    [m, state.start, state.end]
  );

  const handleClick = useMemo(() => {
    const info = selectionInfo(m, specimen);
    return (step: number = 0) =>
      ({ global, world }: ViewportEvent) => {
        if (ref && specimen) {
          const { top, left } = ref.getBoundingClientRect();
          const point = getPoint(world);
          onSelect?.({
            global: { x: left + global.x, y: top + global.y },
            world: point,
            info: info(point, step),
          });
        }
      };
  }, [ref, onSelect, specimen, m]);

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

  const condition = useMemo(() => {
    if (code && specimen?.eventList) {
      return memoize((n: number) =>
        code && specimen?.eventList
          ? call(code ?? "", "shouldRender", [
              n,
              specimen.eventList[n],
              specimen.eventList,
            ])
          : true
      );
    } else return constant(true);
  }, [code, specimen?.eventList]);

  return (
    <RasterRenderer
      ref={setRef}
      StageProps={props}
      ViewportProps={{
        onClick: handleClick(step),
        onMouseDown: handleMouseEvent,
        onMouseOver: handleMouseEvent,
      }}
    >
      <Nodes nodes={specimen?.eventList} />
      <Nodes nodes={bgNodes} color={bgNodeColor} />
      <LazyNodes
        nodes={specimen?.eventList}
        step={step}
        color={getColor}
        condition={condition}
      />
      <Overlay start={start} end={end} size={size} />
      <Path nodes={specimen?.eventList} step={step} />
      <Selection hover={hover} highlight={selection || active} />
      <Guides width={size.x} height={size.y} alpha={0.24} grid={1} />
    </RasterRenderer>
  );
}