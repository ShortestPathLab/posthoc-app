import { find } from "lodash";
import { Viewport as PixiViewportBase } from "pixi-viewport";
import * as PIXI from "pixi.js";

export type ViewportEvent = {
  global: PIXI.Point;
  world: PIXI.Point;
  event: PointerEvent;
};

export type ViewportEventHandler = (e: ViewportEvent) => void;

export type PointerEvent = "onMouseOver" | "onClick" | "onMouseDown";

export type PropEventPair = {
  prop: PointerEvent;
  event: string;
  filter?: boolean;
};

export const events = [
  { prop: "onMouseOver", event: "mousemove" },
  { prop: "onClick", event: "click", filter: true },
  { prop: "onClick", event: "tap", filter: true },
  { prop: "onMouseDown", event: "pointerdown", filter: true },
] as PropEventPair[];

export class PixiViewport extends PixiViewportBase {
  events: {
    [K in string]?: () => void;
  } = {};
  register(prop: PointerEvent, handler?: ViewportEventHandler) {
    const { event, filter } = find(events, (c) => c.prop === prop)!;
    this.events?.[event]?.();
    if (handler) {
      const f = (e: PIXI.InteractionEvent) => {
        const { global } = e.data;
        if (!filter || this.input.clickedAvailable) {
          handler?.({
            global,
            world: this.toWorld(global),
            event: prop,
          });
        }
      };
      this.on(event, f);
      this.events[event] = () => this.off(event, f);
    }
  }
}
