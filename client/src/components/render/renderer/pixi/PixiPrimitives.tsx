import { Graphics as GraphicsType, } from "@pixi/graphics";
import { Component, Event } from "../../types/render";
import * as PIXI from 'pixi.js';
import memoizee from "memoizee";

export type DrawInstruction = (event: Event) => (graphic: GraphicsType) => void;

export type InstrinsicComponents = {
  [key: string]: {
    "converter": (comp: Component) => DrawInstruction,
    "renderer": string
  }
}

// default context
const defaultContext = {
  current: null,
  parent: null,
  events: null,
  colour: {
    source: 0x26a69a,
    destination: 0xf06292,
    expanding: 0xff5722,
    updating: 0xff5722,
    generating: 0xffeb3b,
    closing: 0xb0bec5,
    end: 0xec407a,
  },
  scale: 0.75,
  fill: 0x000000,
  alpha: 1,
}

const scale = (length: number): number => {
  return length * defaultContext.scale;
}

export const d2InstrinsicComponents: InstrinsicComponents = {
  "rect": {
    "converter": (comp: Component) => rectDrawingCoverter(comp),
    "renderer": "2d-pixi",
  }
}

function rectDrawingCoverter(component: Component) {

  return memoizee((event: Event) => {
    
    const element:Component = {...component};
    // Execute the computed props from the event
    for (const prop in component) {
      if (typeof component[prop] === "function") {
        element[prop] = component[prop](event);
      }
    }

    // Determine color by event type
    let color: number | undefined = undefined;
    if (event.type !== undefined && event.type in defaultContext.colour) {
      color = defaultContext.colour[event.type as keyof typeof defaultContext.colour];
    }
    if (!color) {
      console.error(`No color defined for event type ${event.type} on context`);
    }

    // calculate shape variables based on result of computed props
    const [x, y, w, h] = [
      scale(element.x),
      scale(element.y),
      scale(element.width ?? 1),
      scale(element.height ?? 1)
    ];

    // if text defined, provide text object
    let text: PIXI.Text;
    if (element.text) {
      text = new PIXI.Text(element.text, {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: "black",
      });
      text.y = y
      text.x = x;
    }

    // draw instructions on PIXI graphics
    return (g: GraphicsType) => {
      g.beginFill(
          element.fill ?? color ?? 0xff5722,
          element.alpha ?? defaultContext.alpha)
        .drawRect(x, y, w, h)
        .endFill();
      if (text !== undefined){
        g.addChild(text)
      }
    }
  })
}