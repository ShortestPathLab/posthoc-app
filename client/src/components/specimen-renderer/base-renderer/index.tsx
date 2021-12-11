import { Stage } from "@inlet/react-pixi";
import { call } from "components/script-editor/call";
import { Point, RendererProps } from "components/specimen-renderer/Renderer";
import { constant, delay, memoize, throttle } from "lodash";
import {
  cloneElement,
  ComponentProps,
  ReactElement,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { info as selectionInfo } from "../info";
import { byPoint, NodePredicate } from "../isNode";
import { MapInfo } from "../map-parser/MapInfo";
import { PlanarRenderer } from "../planar-renderer";
import {
  LazyNodeList as LazyNodes,
  NodeList as Nodes,
  Props as NodesProps,
} from "../planar-renderer/NodeList";
import { ViewportEvent } from "../planar-renderer/PixiViewport";
import { Selection } from "../planar-renderer/Selection";
import { Scale } from "../Scale";
import { Guides } from "./Guides";
import {
  progressOptions as defaultProgressOptions,
  shadowOptions as defaultShadowOptions,
} from "./options";

export type BaseRendererProps = {
  map: MapInfo;
  scale: Scale<Point>;
  isNode?: NodePredicate;
  ProgressProps?: NodesProps<string>;
  ShadowProps?: NodesProps<string>;
  children?: ReactElement[];
} & RendererProps &
  Omit<ComponentProps<typeof Stage>, "onSelect" | "children">;

export function BaseRenderer({
  map,
  scale,
  isNode = byPoint,
  onSelect,
  selection,
  children,
  ShadowProps: shadowOptions,
  ProgressProps: progressOptions,
  ...props
}: BaseRendererProps) {
  const info = { map, scale };

  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [{ specimen }] = useSpecimen();
  const [{ step = 0, code }] = useUIState();

  const [active, setActive] = useState<Point>();
  const [hover, setHover] = useState<Point>();

  const { from, scale: s } = scale;
  const { snap, nodeAt } = map;

  const handleClick = useCallback(
    ({ global, world }: ViewportEvent, step: number = 0) => {
      if (ref && specimen) {
        const { top, left } = ref.getBoundingClientRect();
        const point = snap(from(world), s);
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
    [ref, onSelect, specimen, snap, s, nodeAt, from, isNode]
  );

  const handleMouseEvent = useMemo(() => {
    let timeout = 0;
    const resolveHover = throttle((p) => setHover(snap(p, s)), 100);
    return ({ world, event }: ViewportEvent) => {
      switch (event) {
        case "onMouseOver":
          resolveHover(from(world));
          setActive(undefined);
          clearTimeout(timeout);
          break;
        case "onMouseDown":
          timeout = delay(() => setActive(snap(from(world), s)), 100);
          break;
      }
    };
  }, [snap, setHover, from, s]);

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
      <Nodes
        options={defaultShadowOptions}
        {...shadowOptions}
        {...info}
        nodes={specimen?.eventList}
      />
      <LazyNodes
        options={defaultProgressOptions}
        {...progressOptions}
        {...info}
        nodes={specimen?.eventList}
        step={step}
        condition={condition}
      />
      {children?.map((c) => cloneElement(c, info))}
      <Selection {...info} hover={hover} highlight={selection || active} />
      <Guides {...info} alpha={0.24} grid={1} />
    </PlanarRenderer>
  );
}
