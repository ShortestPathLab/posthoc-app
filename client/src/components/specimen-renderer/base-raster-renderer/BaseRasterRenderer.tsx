import { Stage } from "@inlet/react-pixi";
import { call } from "components/script-editor/call";
import { Point, RendererProps } from "components/specimen-renderer/Renderer";
import { constant, delay, memoize, throttle } from "lodash";
import { ComponentProps, useCallback, useMemo, useState } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { getColor } from "../colors";
import { info as selectionInfo } from "../info";
import { byPoint, NodePredicate } from "../isNode";
import { MapInfo } from "../map-parser/MapInfo";
import {
  LazyNodeList as LazyNodes,
  NodeList as Nodes,
} from "../planar-renderer/NodeList";
import { ViewportEvent } from "../planar-renderer/PixiViewport";
import { PlanarRenderer } from "../planar-renderer";
import { Selection } from "../planar-renderer/Selection";
import { Transform } from "../Transform";
import { Guides } from "./Guides";
import { Path } from "./Path";

export type BaseRasterRendererProps = {
  map: MapInfo;
  transform: Transform<Point>;
  isNode?: NodePredicate;
} & RendererProps &
  Omit<ComponentProps<typeof Stage>, "onSelect">;

export function BaseRasterRenderer({
  map,
  transform,
  isNode = byPoint,
  onSelect,
  selection,
  children,
  ...props
}: BaseRasterRendererProps) {
  const info = { map, transform };

  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [{ specimen }] = useSpecimen();
  const [{ step = 0, code }] = useUIState();

  const [active, setActive] = useState<Point | undefined>(undefined);
  const [hover, setHover] = useState<Point | undefined>(undefined);

  const { from, scale } = transform;
  const { snap, nodeAt } = map;

  const handleClick = useCallback(
    ({ global, world }: ViewportEvent, step: number = 0) => {
      if (ref && specimen) {
        const { top, left } = ref.getBoundingClientRect();
        const point = snap(from(world), scale);
        if (point) {
          onSelect?.({
            global: { x: left + global.x, y: top + global.y },
            world: point,
            info: {
              ...selectionInfo(specimen, step, nodeAt(point), (s) =>
                isNode(s, point)
              ),
              point: point,
            },
          });
        }
      }
    },
    [ref, onSelect, specimen, snap, scale, nodeAt, from, isNode]
  );

  const handleMouseEvent = useMemo(() => {
    let timeout = 0;
    const resolveHover = throttle((p) => setHover(snap(p, scale)), 100);
    return ({ world, event }: ViewportEvent) => {
      switch (event) {
        case "onMouseOver":
          resolveHover(from(world));
          setActive(undefined);
          clearTimeout(timeout);
          break;
        case "onMouseDown":
          timeout = delay(() => setActive(snap(from(world), scale)), 100);
          break;
      }
    };
  }, [snap, setHover, from, scale]);

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
    <PlanarRenderer
      ref={setRef}
      StageProps={props}
      BoxProps={{ sx: { cursor: hover ? "pointer" : "auto" } }}
      ViewportProps={{
        onClick: (e) => handleClick(e, step),
        onMouseDown: handleMouseEvent,
        onMouseOver: handleMouseEvent,
      }}
    >
      <Nodes {...info} nodes={specimen?.eventList} />
      <LazyNodes
        {...info}
        nodes={specimen?.eventList}
        step={step}
        color={getColor}
        condition={condition}
      />
      {children}
      <Path {...info} nodes={specimen?.eventList} step={step} />
      <Selection {...info} hover={hover} highlight={selection || active} />
      <Guides {...info} alpha={0.24} grid={1} />
    </PlanarRenderer>
  );
}
