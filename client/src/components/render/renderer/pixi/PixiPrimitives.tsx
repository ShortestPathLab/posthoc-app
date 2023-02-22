import { Graphics as GraphicsType, } from "@pixi/graphics";
import { Component, Event, Nodes } from "../../types/render";
import * as PIXI from 'pixi.js';
import memoizee from "memoizee";

export type DrawInstruction = ((eventContext: EventContext) => (graphic: GraphicsType) => void) & { persisted?: boolean };

export type InstrinsicComponents = {
  [key: string]: {
    "converter": (comp: Component) => DrawInstruction,
    "renderer": string
  }
}

export type EventContext = {
  parent: Event | undefined,
  nodes?: Nodes,
  colour: {
    [key: string]: number
  }
  scale?: number
} & Event

export type TextObject = {
  displayText: string,
  fontSize: number,
  fill: string, 
  x: number, 
  y: number
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
  scale: 10,
  fill: 0x000000,
  alpha: 1,
}

export const scale = (length: number): number => {
  return length * defaultContext.scale;
}

export const d2InstrinsicComponents: InstrinsicComponents = {
  "rect": {
    "converter": (comp: Component) => pixiInterlangConventer(comp),
    "renderer": "2d-pixi",
  },
  "circle": {
    "converter": (comp: Component) => pixiInterlangConventer(comp),
    "renderer": "2d-pixi",
  },
  "polygon": {
    "converter": (comp: Component) => pixiInterlangConventer(comp),
    "renderer": "2d-pixi",
  },
  "path": {
    "converter": (comp: Component) => pixiInterlangConventer(comp),
    "renderer": "2d-pixi",
  }
}

function executeComponent(component: Component, event: EventContext) {
  const element: Component = { ...component };
  // Execute the computed props from the event
  for (const prop in component) {
    if (typeof component[prop] === "function") {
      element[prop] = component[prop](event);
    }
  }

  return element
}

function textElement(text: TextObject | undefined) {
  // if text defined, provide text object
  let textObj: PIXI.Text | undefined = undefined;

  if (text) {
    textObj = new PIXI.Text(text.displayText, {
      fontFamily: 'Arial',
      fontSize: text.fontSize,
      fill: text.fill,
    });
    textObj.y = scale(text.y);
    textObj.x = scale(text.x);
    textObj.resolution = 100;
  }
  return textObj

}

function pixiInterlangConventer(component: Component) {
  function drawInstruction(eventContext: EventContext) {
    if (eventContext) {
      // executes all the computed properties
      const element: Component = executeComponent(component, eventContext);

      // Determine color by event type
      let color: number | undefined = eventContext.type && eventContext.type in eventContext.colour? eventContext.colour[eventContext.type]:undefined;
      if (!color) {
        console.error(`No color defined for event type ${eventContext.type} on context`);
      }

      let textObj: PIXI.Text | undefined;
      // draw instructions on PIXI graphics
      return (g: GraphicsType) => {

        const fillColour = element.fill ?? color ?? 0xff5722
        g.beginFill(fillColour,
            element.alpha ?? defaultContext.alpha)

        switch (component.$) {
          case "rect":
            const [rectX, rectY, rectW, rectH] = [
              scale(element.x),
              scale(element.y),
              scale(element.width ?? 1),
              scale(element.height ?? 1)
            ];

            element.text&&(textObj = textElement(element.text));
            g.drawRect(rectX, rectY, rectW, rectH)
            break;

          case "circle":
            const [circX, circY, circR] = [
              scale(element.x),
              scale(element.y),
              scale(element.radius ?? 1)
            ];
            g.drawCircle(circX, circY, circR)
            break;
          //@ts-ignore
          case "path":
            // fallthrough is wanted, as polygons and paths are drawn the same way
            g.lineStyle({ width: element.lineWidth , color:fillColour})

          case "polygon":
            const points = element.points.map((point: { x: number, y: number }) => { return { x: scale(point.x), y: scale(point.y) } })

            g.drawPolygon(points)
            break;

          default:
            throw Error("Invalid primitive for the PIXI renderer")
        }
        g.endFill();
        if (textObj !== undefined) {
          g.addChild(textObj)
        }
      }
    } else {
      return (g: GraphicsType) => { }
    }
  }

  drawInstruction.persisted = component.persisted !== undefined ? component.persisted : true;

  return drawInstruction;
}