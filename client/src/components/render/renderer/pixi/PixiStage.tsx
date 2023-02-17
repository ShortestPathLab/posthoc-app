import * as PIXI from 'pixi.js';
import * as React from "react";
import { Stage } from "@inlet/react-pixi";

import { Event, View } from "components/render/types/render";
import { Viewport } from "./Viewport";
import { d2InstrinsicComponents, DrawInstruction } from "./PixiPrimitives"
import { StageChild } from '../types';
import { PixiViewport } from './PixiViewport';

import { useMemo } from 'react';
import { useSpecimen } from 'slices/specimen';

export type PixiStageProps = {
  width?: number;
  height?: number;
  children?: StageChild;
  view?: View;
}

export type DrawInstructions = {
  [key: string]: DrawInstruction
}

function findRecentParentEvent(pId:number|string|undefined|null, allEvents:Event[]):Event|undefined{

  for (let i = allEvents.length - 1; i >= 0; i--){
    if (allEvents[i]?.id === pId){
      return allEvents[i]
    }
  }
  return undefined
}

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

export function PixiStage(
  { width, height, view, children }: PixiStageProps
) {
  const viewport = React.useRef<PixiViewport>(null);
  const [{map}] = useSpecimen();

  const renderMap = React.useCallback(() => {
    const g = new PIXI.Graphics();
    if (map?.nodes?.walls) {
      for (const block of map?.nodes?.walls) {
        g.beginFill(0x202124, 1)
          .drawRect(block.x??1, (block.y??1) - 4, 1, 1)
          .endFill();
      }
    }
    viewport.current?.addChild(g);
  }, [map])

  // process all the parsed components into drawing instructions 
  const drawInstructs: DrawInstructions = useMemo(() => {
    if (!view) {
      throw new Error("No view is present in PixiStageProps");
    }
    const viewComps = view.components;
    const drawInstructions: DrawInstructions = {};
    for (const compName in viewComps) {
      const component = viewComps[compName as keyof object]
      drawInstructions[compName] = d2InstrinsicComponents[component.$].converter(component);
    }
    return drawInstructions;
  }, [view])

  // a function which takes in an Event List creates a graphic for them
  const makeGraphic = React.useCallback((events: Event[], hasCurrent: boolean) => {
    // loops through all the events and the drawing instructions
    // adding them all to the PIXI graphic
    renderMap();
    const eventContext = {
      allEvents:events,
      colour: {
        source: 0x26a69a,
        destination: 0xf06292,
        expanding: 0xff5722,
        updating: 0xff5722,
        generating: 0xffeb3b,
        closing: 0xb0bec5,
        end: 0xec407a,
      },
    }
    const g = new PIXI.Graphics();
    for (const compName in drawInstructs) {
      const drawInstruction = drawInstructs[compName];
      if (drawInstruction.persisted === true) {
        for (const event of events) {
          // create the context here
          // spread the current event and get the parent event aswell
          let parentEvent = findRecentParentEvent(event?.pId, events)
          // TODO fix this parent section 
          if (parentEvent === undefined){
            parentEvent = event
          }
          // TODO fix how the currentEventContext is created
          const currentEventContext = { ...eventContext, parent:parentEvent, ...event}
          drawInstruction(currentEventContext)(g);
        }
      } else if (events[events.length - 1] && hasCurrent) {
        const curEvent = events[events.length - 1]
          // TODO fix this parent section 
        let parentEvent = findRecentParentEvent(curEvent?.pId, events)

        if (parentEvent === undefined){
          parentEvent = curEvent
        }


        const currentEventContext = { ...eventContext, parent:parentEvent, ...curEvent}
        drawInstruction(currentEventContext)(g);
      }
    }
    return g;
  }, [drawInstructs]);

  // create an add function that adds the graphic to a canvas and then returns a remove function
  const canvas = React.useCallback(
    () => ({
      add: (events: Event[], hasCurrent: boolean) => {
        const graphic = makeGraphic(events, hasCurrent);
        viewport.current?.addChild?.(graphic);
        return () => {
          viewport.current?.removeChild?.(graphic);
        }
      }
    }), []
  )

  return (<>
    <Stage
      width={width} height={height}
      options={{
        backgroundColor: 0xffffff,
        autoDensity: true,
        clearBeforeRender: false,
        resolution: 1,
        antialias: true,
      }}
    >
      <Viewport ref={viewport} width={width} height={height} />
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
        children?.(canvas)
      }
    </Stage>
  </>)
}