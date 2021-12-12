import { Stage } from "@inlet/react-pixi";
import { call } from "components/script-editor/call";
import { Point, RendererProps } from "components/renderer/Renderer";
import { constant, delay, memoize, throttle } from "lodash";
import {
  cloneElement,
  ComponentProps,
  ReactElement,
  useCallback,
  useMemo,
  Children,
  useState,
} from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { info as selectionInfo } from "../info";
import { byPoint, NodePredicate } from "../NodePredicate";
import { MapInfo } from "../Parser";
import { PlanarRenderer } from "../planar";
import {
  LazyNodeList as LazyNodes,
  NodeList as Nodes,
  Props as NodesProps,
} from "../planar/NodeList";
import { ViewportEvent } from "../planar/PixiViewport";
import { Selection } from "../planar/Selection";
import { Scale } from "../Scale";
import { Guides } from "./Guides";
import {
  progressOptions as defaultProgressOptions,
  shadowOptions as defaultShadowOptions,
} from "./options";

const { map } = Children;

export type BaseRendererProps = {
  map: MapInfo;
  scale: Scale<Point>;
  isNode?: NodePredicate;
  ProgressProps?: NodesProps<string>;
  ShadowProps?: NodesProps<string>;
  overlay?: ReactElement | ReactElement[];
  children?: ReactElement | ReactElement[];
} & RendererProps &
  Omit<ComponentProps<typeof Stage>, "onSelect" | "children">;

export function BaseRenderer({
  map: m,
  scale,
  isNode = byPoint,
  onSelect,
  selection,
  children,
  overlay,
  ShadowProps: shadowOptions,
  ProgressProps: progressOptions,
  ...props
}: BaseRendererProps) {
  const info = { map: m, scale };

  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [{ specimen }] = useSpecimen();
  const [{ step = 0, code }] = useUIState();

  const [active, setActive] = useState<Point>();
  const [hover, setHover] = useState<Point>();

  const { from, scale: s } = scale;
  const { snap, nodeAt } = m;

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
      {map(children, (c) => c && cloneElement(c, info))}
      <LazyNodes
        options={defaultProgressOptions}
        {...progressOptions}
        {...info}
        nodes={specimen?.eventList}
        step={step}
        condition={condition}
      />
      {map(overlay, (c) => c && cloneElement(c, info))}
      <Selection {...info} hover={hover} highlight={selection || active} />
      <Guides {...info} alpha={0.24} grid={1} />
    </PlanarRenderer>
  );
}
