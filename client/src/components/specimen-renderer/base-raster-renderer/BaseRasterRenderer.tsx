import { Stage } from "@inlet/react-pixi";
import { call } from "components/script-editor/call";
import { Point, RendererProps } from "components/specimen-renderer/Renderer";
import { constant, delay, identity, memoize, throttle } from "lodash";
import { ComponentProps, useCallback, useMemo, useState } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { getColor } from "../colors";
import { info } from "../info";
import { byPoint, NodePredicate } from "../isNode";
import { MapHandler } from "../MapParser";
import { Guides } from "../raster-renderer/Guides";
import {
  LazyNodeList as LazyNodes,
  NodeList as Nodes,
} from "../raster-renderer/NodeList";
import { Path } from "../raster-renderer/Path";
import { ViewportEvent } from "../raster-renderer/PixiViewport";
import { RasterRenderer } from "../raster-renderer/RasterRenderer";
import { Selection } from "../raster-renderer/Selection";

export type BaseRasterRendererProps = {
  isNode?: NodePredicate;
} & Partial<MapHandler> &
  RendererProps &
  Omit<ComponentProps<typeof Stage>, "onSelect">;

export function BaseRasterRenderer({
  size,
  resolve,
  getNode,
  isNode = byPoint,
  from = identity,
  onSelect,
  selection,
  children,
  ...props
}: BaseRasterRendererProps) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [{ specimen }] = useSpecimen();
  const [{ step = 0, code }] = useUIState();

  const [active, setActive] = useState<Point | undefined>(undefined);
  const [hover, setHover] = useState<Point | undefined>(undefined);

  const handleClick = useCallback(
    ({ global, world }: ViewportEvent, step: number = 0) => {
      if (ref && specimen) {
        const { top, left } = ref.getBoundingClientRect();
        const point = resolve?.(world);
        if (point) {
          onSelect?.({
            global: { x: left + global.x, y: top + global.y },
            world: point,
            info: {
              ...info(specimen, step, getNode?.(point), (s) =>
                isNode(s, from(point))
              ),
              point: from(point),
            },
          });
        }
      }
    },
    [ref, onSelect, specimen, getNode, resolve, from, isNode]
  );

  const handleMouseEvent = useMemo(() => {
    let timeout = 0;
    const resolveHover = throttle((p) => setHover(resolve?.(p)), 100);
    return ({ world, event }: ViewportEvent) => {
      switch (event) {
        case "onMouseOver":
          resolveHover(world);
          setActive(undefined);
          clearTimeout(timeout);
          break;
        case "onMouseDown":
          timeout = delay(() => setActive(resolve?.(world)), 100);
          break;
      }
    };
  }, [resolve, setHover]);

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
      BoxProps={{ sx: { cursor: hover ? "pointer" : "auto" } }}
      ViewportProps={{
        onClick: (e) => handleClick(e, step),
        onMouseDown: handleMouseEvent,
        onMouseOver: handleMouseEvent,
      }}
    >
      <Nodes nodes={specimen?.eventList} />
      <LazyNodes
        nodes={specimen?.eventList}
        step={step}
        color={getColor}
        condition={condition}
      />
      {children}
      <Path nodes={specimen?.eventList} step={step} />
      <Selection hover={hover} highlight={selection || active} />
      <Guides width={size?.x} height={size?.y} alpha={0.24} grid={1} />
    </RasterRenderer>
  );
}
