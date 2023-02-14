import { Graphics as GraphicsType, } from "@pixi/graphics";
import { Component, Event } from "../../types/render";
import * as PIXI from 'pixi.js';
import memoizee from "memoizee";

export type DrawInstruction = ((event: Event) => (graphic: GraphicsType) => void) & {persisted?: boolean};

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
  },
  "circle": {
    "converter": (comp: Component) => circleDrawingCoverter(comp),
    "renderer": "2d-pixi",
  },
  "polygon":{
    "converter": (comp: Component) => polygonDrawingCoverter(comp),
    "renderer": "2d-pixi",
  },
  "path":{
    "converter": (comp: Component) => pathDrawingCoverter(comp),
    "renderer": "2d-pixi",
  }
}

function executeComponent(component: Component, event:Event ){

  const element:Component = {...component};
    // Execute the computed props from the event
    for (const prop in component) {
      if (typeof component[prop] === "function") {
        element[prop] = component[prop](event);
      }
    }

  return element
}

function textElement(text:string|undefined, x:number, y:number){
    // if text defined, provide text object
    let textObj: PIXI.Text|undefined = undefined;
    if (text) {
      textObj = new PIXI.Text(text, {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: "black",
      });
      textObj.y = y
      textObj.x = x;
    }
    return textObj

}

function pathDrawingCoverter(component: Component){
  return memoizee((event: Event) => {
    
    // executes all the computed properties
    const element:Component = executeComponent(component, event)

    // Determine color by event type
    let color: number | undefined = undefined;
    if (event.type !== undefined && event.type in defaultContext.colour) {
      color = defaultContext.colour[event.type as keyof typeof defaultContext.colour];
    }
    if (!color) {
      console.error(`No color defined for event type ${event.type} on context`);
    }

    // calculate shape variables based on result of computed props
    const points = element.points.map((point:{x:number, y:number}) => {return {x:scale(point.x), y:scale(point.y)}})

    // creates text object (undefined if no text)
    // TODO text on a polygon (maybe we find the center coordinates based on the points)
    // const textObj = textElement(element.text, x, y)

    // draw instructions on PIXI graphics
    return (g: GraphicsType) => {
      g.beginFill(
          element.fill ?? color ?? 0xff5722,
          element.alpha ?? defaultContext.alpha)
        .drawPolygon(points)
        .endFill();
      // if (textObj !== undefined){
      //   g.addChild(textObj)
      // }
    }
  })
}

function polygonDrawingCoverter(component: Component){
  return memoizee((event: Event) => {
    
    // executes all the computed properties
    const element:Component = executeComponent(component, event)

    // Determine color by event type
    let color: number | undefined = undefined;
    if (event.type !== undefined && event.type in defaultContext.colour) {
      color = defaultContext.colour[event.type as keyof typeof defaultContext.colour];
    }
    if (!color) {
      console.error(`No color defined for event type ${event.type} on context`);
    }

    // calculate shape variables based on result of computed props


    const points = element.points.map((point:{x:number, y:number}) => {return {x:scale(point.x), y:scale(point.y)}})

    // creates text object (undefined if no text)
    // TODO text on a polygon (maybe we find the center coordinates based on the points)
    // const textObj = textElement(element.text, x, y)

    // draw instructions on PIXI graphics
    return (g: GraphicsType) => {
      g.beginFill(
          element.fill ?? color ?? 0xff5722,
          element.alpha ?? defaultContext.alpha)
        .drawPolygon(points)
        .endFill();
      // if (textObj !== undefined){
      //   g.addChild(textObj)
      // }
    }
  })
}

function circleDrawingCoverter(component: Component){
  return memoizee((event: Event) => {
    
    // executes all the computed properties
    const element:Component = executeComponent(component, event)

    // Determine color by event type
    let color: number | undefined = undefined;
    if (event.type !== undefined && event.type in defaultContext.colour) {
      color = defaultContext.colour[event.type as keyof typeof defaultContext.colour];
    }
    if (!color) {
      console.error(`No color defined for event type ${event.type} on context`);
    }

    // calculate shape variables based on result of computed props
    const [x, y, r] = [
      scale(element.x),
      scale(element.y),
      scale(element.radius ?? 1)
    ];

    // creates text object (undefined if no text)
    const textObj = textElement(element.text, x, y)

    // draw instructions on PIXI graphics
    return (g: GraphicsType) => {
      g.beginFill(
          element.fill ?? color ?? 0xff5722,
          element.alpha ?? defaultContext.alpha)
        .drawCircle(x,y,r)
        .endFill();
      if (textObj !== undefined){
        g.addChild(textObj)
      }
    }
  })
}

function rectDrawingCoverter(component: Component) {
  function drawInstruction(event: Event) {
    // executes all the computed properties
    const element:Component = executeComponent(component, event)

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

    // creates text object (undefined if no text)
    const textObj = textElement(element.text, x, y)

    // draw instructions on PIXI graphics
    return (g: GraphicsType) => {
      g.beginFill(
          element.fill ?? color ?? 0xff5722,
          element.alpha ?? defaultContext.alpha)
        .drawRect(x, y, w, h)
        .endFill();
      if (textObj !== undefined){
        g.addChild(textObj)
      }
    }
  }

  drawInstruction.persisted = component.persisted ? component.persisted : true;

  return drawInstruction;
}