/**
 * Adapted from https://codesandbox.io/s/react-pixi-viewport-9ngfd
 * @author roxgarage
 */

import { PixiComponent, useApp } from "@inlet/react-pixi";
import { map } from "lodash";
import * as PIXI from "pixi.js";
import React, { ComponentProps, forwardRef } from "react";
import {
  PointerEvent,
  PixiViewport,
  events,
  ViewportEventHandler,
} from "./PixiViewport";

const scale = 1;

export type ViewportProps = {
  width?: number;
  height?: number;
  children?: React.ReactNode;
  event?: PIXI.InteractionEvent;
} & { [K in PointerEvent]?: ViewportEventHandler };

export type Props = {
  app: PIXI.Application;
} & ViewportProps;

function create(props: Props) {
  const viewport = new PixiViewport({
    interaction: props.app.renderer.plugins.interaction,
    ticker: props.app.ticker,
    stopPropagation: true,
    passiveWheel: false,
  })
    .drag()
    .pinch()
    .wheel()
    .decelerate({ friction: 0.98 })
    .clampZoom({ maxScale: 30, minScale: 0.05 });
  return viewport as PixiViewport;
}

/**
 * Hanle props updates
 * re-subscribe all event listeners
 * resize based on width and height
 * @param v current viewport instance
 * @param prev previous props
 * @param param2 new props
 */
function applyProps(
  v: PixiViewport,
  prev: Props,
  { width, height, ...next }: Props
) {
  for (const { equal, apply } of [
    ...map(events, ({ prop }) => ({
      equal: prev[prop] === next[prop],
      apply: () => v.register(prop, next[prop]),
    })),
    {
      prop: prev.width === width && prev.height === height,
      apply: () => v.resize(width, height, (width ?? 0) * 2, (height ?? 0) * 2),
    },
  ]) {
    !equal && apply();
  }
}

// define a custom pixi react class component, create is a lifecycle method
const Component = PixiComponent<Props, PixiViewport>("Viewport", {
  create: (props) => {
    const viewport = create(props);
    applyProps(viewport, props, props);
    return viewport;
  },
  applyProps,
});

type PixiViewportProps = ViewportProps &
  Partial<ComponentProps<typeof Component>>;

// provide app instance to View port
export const Viewport = forwardRef<PixiViewport, PixiViewportProps>(
  (props, ref) => {
    const app = useApp();
    return <Component app={app} {...props} ref={ref} />;
  }
);
