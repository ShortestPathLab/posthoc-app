import { Graphics as GraphicsType, } from "@pixi/graphics";
import { Component, Event } from "../../types/render";

export type DrawingInstruction = (g:GraphicsType, event:Event) => void;

export type InstrinsicComponents = {
  [key:string]: {"converter" : (comp:Component)=>DrawingInstruction,
                 "renderer": string}
}

// default context
const context = {
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
  scale: 15,
  fill: 0x000000,
  alpha: 1,
}

const scale = (length: number): number => {
  return length * context.scale;
}

export const d2InstrinsicComponents: InstrinsicComponents = {
  "rect": {
    "converter": (comp: Component) => rectDrawingCoverter(comp),
    "renderer": "2d-pixi",
  }
}

function rectDrawingCoverter(component: Component) {

  return (g: GraphicsType, event: Event) => {

    for (const prop in component) {
      if (typeof component[prop] === "function") {
        component[prop] = component[prop](event);
      }
    }

    let color;

    if (event.type in context.colour) {
      color = context.colour[event.type as keyof typeof context.colour];
    }
    if (!color) {
      console.dir(event.type);
    }

    g
      .beginFill(
        event.fill ?? component.fill ?? color ?? 0x000000,
        event.alpha ?? component.alpha ?? context.alpha)
      .drawRect(
        scale(event.x ?? component.x),
        scale(event.y ?? component.y),
        scale(event.width ?? component.width ?? 1),
        scale(event.height ?? component.height ?? 1)
      )
      .endFill();
  }
}