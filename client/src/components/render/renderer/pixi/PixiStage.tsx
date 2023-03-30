import * as PIXI from "pixi.js";
import * as React from "react";
import { Stage } from "@inlet/react-pixi";

import { Nodes, View } from "protocol/Render";
import { Viewport } from "./Viewport";
import {
  d2InstrinsicComponents,
  DrawInstruction,
  EventContext,
  pixiPathDrawer,
  scale,
} from "./PixiPrimitives";
import { StageChild } from "../types";
import { PixiViewport } from "./PixiViewport";

import { useMemo } from "react";
import { useSpecimen } from "slices/specimen";
import {
  SplitViewContext,
  useViewContext,
} from "components/inspector/SplitPanes";
import { useTheme } from "@material-ui/core";
import { hex } from "components/renderer/colors";
import { TraceComponent, TraceEventType } from "protocol/Trace";
import { coloursToHex } from "../generic/colours";
import { useNodesMap } from "../generic/NodesMap";
import { get, set } from "lodash";
import { CompressOutlined } from "@material-ui/icons";

export type PixiStageProps = {
  width?: number;
  height?: number;
  children: StageChild;
  view: View;
  viewName: string;
};

export type DrawInstructions = {
  [key: string]: DrawInstruction;
};

export type EventTypeColoursTypeHex = {
  [k in TraceEventType]: number;
};

/**
 * PIXI Stage component for rendering view and search trace,
 * view must be composed of following supported primitives
 * - rect (Rectangle)
 * - circle
 * - path
 * - polygon
 * @param props Stage properties
 * @param props.width Width of the allocated view space
 * @param props.height Height of the allocated view space
 * @param props.view {View} View definition from Intermediate Language
 * @returns Pixi Stage element that renders current view
 */

export function PixiStage({
  width,
  height,
  view,
  viewName,
  children,
}: PixiStageProps) {
  const viewport = React.useRef<PixiViewport>(null);
  const [{ map }] = useSpecimen();
  const theme = useTheme();
  const globalNodes = useNodesMap();
  const { click, setClick } = globalNodes;

  const [svData, updateSvData] = useViewContext();

  // Map<number|stirng, {x:number, y:number}>();

  const colours = useMemo(() => {
    return coloursToHex(theme.event);
  }, [theme]);

  // ZOOM: restore viewport state
  React.useEffect(() => {
    if (viewport.current) {
      if (svData?.[viewName]?.viewport) {
        const vpData = svData?.[viewName]?.viewport;
        if (vpData) {
          viewport.current.moveCorner(vpData.x, vpData.y);
          viewport.current.setZoom(vpData.scale);
        }
      }
    }
  }, [theme.palette.mode, viewport]);

  React.useEffect(() => {
    // MAP: draw map background
    const g = new PIXI.Graphics();
    if (map?.nodes?.walls) {
      for (const block of map?.nodes?.walls) {
        g.beginFill(hex(theme.map.walls), 1)
          .drawRect(
            scale(block.x ?? 1),
            scale((block.y ?? 1) - 4),
            scale(1),
            scale(1)
          )
          .endFill();
      }
    }
    viewport.current?.addChild(g);
    // MAP: provide fitmap callback to splitview
    updateSvData({
      view: viewName,
      payload: {
        map: {
          fitMap: () => {
            if (map?.bounds?.width && map.bounds.height) {
              viewport.current?.fitMap(
                scale(map?.bounds?.width),
                scale(map?.bounds?.height)
              );
            }
          },
        },
      },
    });
    return () => {
      viewport.current?.removeChild(g);
    };
  }, [map, theme.palette.mode, viewport]);

  // remember viewport resize information
  const onViewportDestroy = React.useCallback((e) => {
    updateSvData({
      view: viewName,
      payload: {
        viewport: {
          x: e.x,
          y: e.y,
          scale: e.scaleX,
        },
      },
    });
  }, []);

  // create draw instructions for each of the search trace components
  const [drawInstructs, pathComponent]: [
    DrawInstructions,
    TraceComponent | undefined
  ] = useMemo(() => {
    if (!view) {
      throw new Error("No view is present in PixiStageProps");
    }
    const viewComps = view.components;
    const drawInstructions: DrawInstructions = {};
    let pathComponent: TraceComponent | undefined = undefined;
    for (const compName in viewComps) {
      const component = viewComps[compName as keyof object];
      drawInstructions[compName] =
        d2InstrinsicComponents[component.$].converter(component);

      // checks if the component is the pathComponent
      if (pathComponent === undefined && component?.drawPath) {
        pathComponent = component;
      }
    }
    return [drawInstructions, pathComponent];
  }, [view.components]);

  // draws the path from current to source
  React.useEffect(() => {
    let curNode = globalNodes.current;

    if (pathComponent && curNode && globalNodes.nodes) {
      const pathGraphic: PIXI.Graphics = pixiPathDrawer(
        pathComponent,
        curNode,
        globalNodes.nodes,
        hex(theme.map.path ?? "#66bb6a")
      );
      viewport.current?.addChild(pathGraphic);
      return () => viewport.current?.removeChild(pathGraphic);
    }

    return () => {};
  }, [
    globalNodes.nodes,
    globalNodes.current,
    globalNodes.successors,
    viewport,
    theme.palette.mode,
  ]);

  // clean the canvas after view distroyed
  React.useEffect(() => {
    return () => {
      viewport.current?.removeChildren();
    };
  }, [viewport]);

  React.useEffect(() => {
    const vpClickHandler = (e: any) => {
      if (e.target instanceof PixiViewport) {
        setClick?.(undefined);
      }
      if (click) {
        click?.remove?.();
      }
    };
    viewport.current?.on("click", vpClickHandler);
    return () => {
      viewport.current?.off("click", vpClickHandler);
    };
  }, [click]);

  const onGraphicClickHandler = React.useCallback(
    (e: PIXI.InteractionEvent) => {
      const origin = e.currentTarget as PIXI.Graphics;
      const overlay = origin.clone();
      overlay.tint = 0x000000;
      overlay.alpha = 0.3;
      viewport.current?.addChild(overlay);

      let tempPath: PIXI.Graphics;
      const event = globalNodes.nodes?.get(get(e.target, "id"))?.[0];
      if (pathComponent && event && globalNodes.nodes) {
        tempPath = pixiPathDrawer(
          pathComponent,
          event,
          globalNodes.nodes,
          hex(theme.map.guide ?? "#e53935"),
          globalNodes.successors
        );
        viewport.current?.addChild(tempPath);
      }

      const cl = {
        node: globalNodes.nodes?.get(get(e.target, "id")),
        nodes: globalNodes.nodesAll?.get(get(e.target, "id")),
        point: { ...e.data.global },
        remove: () => {
          viewport.current?.removeChild(overlay);
          viewport.current?.removeChild(tempPath);
        },
      };
      setClick?.(cl);
    },
    [
      viewport,
      globalNodes.nodes,
      setClick,
      pathComponent,
      globalNodes.successors,
    ]
  );

  // draw single graphics and add click event handler
  const makeAndAttachComp = React.useCallback(
    (
      drawInstruct: DrawInstruction,
      container: PIXI.Container,
      context: EventContext
    ) => {
      const graph = new PIXI.Graphics();
      drawInstruct(context)(graph);
      graph.interactive = true;
      graph.buttonMode = true;
      set(graph, "id", context.id);
      if (drawInstruct.persist) {
        graph.on("click", onGraphicClickHandler);
      }
      container.addChild(graph);
    },
    [onGraphicClickHandler, drawInstructs]
  );
  /**
   * Create Grapphic object for events
   * @param events list of events need to be rendered using drawInstructs
   * @param hasCurrent indicates if the graphic holds the current step
   */
  const makeGraphic = React.useCallback(
    (nodes: Nodes) => {
      // loops through all the events and the drawing instructions
      // adding them all to the PIXI graphic
      // FIXME nodes is not all nodes but only part of the node rendered by current
      // node list
      const eventContext = {
        nodes,
        colour: {
          ...colours,
        },
      };
      const container = new PIXI.Container();
      for (const compName in drawInstructs) {
        const drawInstruction = drawInstructs[compName];
        if (!drawInstruction.persist && globalNodes?.current?.id) {
          let parent;
          if (globalNodes?.current?.pId) {
            parent = globalNodes?.nodes?.get(globalNodes.current?.pId)?.[0];
          } else {
            parent = globalNodes.current;
          }
          makeAndAttachComp(drawInstruction, container, {
            ...eventContext,
            parent,
            ...globalNodes.current,
          });
        } else {
          for (const [, events] of nodes) {
            // create the context here
            // spread the current event and get the parent event aswell
            const current = events[events.length - 1];
            let parent = current.pId
              ? globalNodes?.nodes?.get(current?.pId)?.[0]
              : current;
            makeAndAttachComp(drawInstruction, container, {
              ...eventContext,
              parent,
              ...current,
            });
          }
        }
        viewport.current?.addChild(container);
      }
      return container;
    },
    [colours, makeAndAttachComp]
  );

  // create an add function that adds the graphic to a canvas and then returns a remove function
  const canvas = React.useCallback(
    () => ({
      add: (nodes: Nodes) => {
        const container = makeGraphic(nodes);
        return () => {
          viewport.current?.removeChild(container);
        };
      },
    }),

    [makeGraphic]
  );

  return (
    <>
      <Stage
        width={width}
        height={height}
        options={{
          backgroundColor: 0xffffff,
          autoDensity: true,
          clearBeforeRender: false,
          resolution: 1,
          antialias: true,
        }}
      >
        <Viewport
          ref={viewport}
          width={width}
          height={height}
          onDestroy={onViewportDestroy}
        />
      </Stage>
      {
        /**
         * Children will be a callback that returns child components
         * wrapped in Fragment and binded with useCanvas prop
         * (useCanvas) => (
         *  <React.Fragment>
         *    <LazyNodeList useCanvas={useCanvas} />
         *  </React.Fragment>
         * )
         */
        children(canvas)
      }
    </>
  );
}
