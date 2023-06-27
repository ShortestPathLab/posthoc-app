import { find } from "lodash";
import { Viewport as PixiViewportBase } from "pixi-viewport";
import * as PIXI from "pixi.js";

export type ViewportEvent = {
  global?: PIXI.Point;
  world?: PIXI.Point;
  event?: PointerEvent;
  [key: string]: any;
};

export type ViewportStateEvent = {
  x: number;
  y: number;
  [key: string]: any;
  scale: {
    x: number;
    y: number;
    [key: string]: any;
  };
};

export type ViewportEventHandler = (
  e: ViewportEvent | ViewportStateEvent
) => void;

export type PointerEvent =
  | "onMouseOver"
  | "onClick"
  | "onMouseDown"
  | "onDestroy";

export type PropEventPair = {
  prop: PointerEvent;
  event: string;
  filter?: boolean;
};

export const events = [
  { prop: "onClick", event: "pointerup", filter: true },
  { prop: "onMouseOver", event: "mousemove" },
  { prop: "onMouseDown", event: "pointerdown", filter: true },
  { prop: "onDestroy", event: "destroy" },
] as PropEventPair[];

// additional property events for keep event destroy callbacks
// additional register method for subscribe events
export class PixiViewport extends PixiViewportBase {
  events: {
    [K in string]?: () => void;
  } = {};
  register(prop: PointerEvent, handler?: ViewportEventHandler) {
    //
    const { event, filter } = find(events, (c) => c.prop === prop)!;
    this.events?.[event]?.();
    if (handler) {
      const f = (e: PIXI.InteractionEvent) => {
        if (e.data) {
          const { global } = e.data;
          if (!filter || this.input.last?.equals(global)) {
            handler?.({
              global,
              world: this.toWorld(global),
              event: prop,
            });
          }
        } else {
          handler?.(e);
        }
      };
      this.on(event, f);
      this.events[event] = () => this.off(event, f);
    }
  }
  // emit destory event for storing viewport exit data using onDestroy prop
  destroy(options?: PIXI.IDestroyOptions | undefined): void {
    const { scaleX, scaleY } = this.lastViewport ?? { scaleX: 1, scaleY: 1 };
    this.setZoom(1);
    this.emit("destroy", { x: this.left, y: this.top, scaleX, scaleY });
    super.destroy(options);
  }
  fitMap(width: number, height: number) {
    this.animate({
      time: 500,
      position: new PIXI.Point(width / 2, height / 2),
      scale: this.findFit(width, height) - 0.1,
      ease: "easeOutQuint",
    });
  }
}
