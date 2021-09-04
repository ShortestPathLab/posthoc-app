/**
 * From https://codesandbox.io/s/react-pixi-viewport-9ngfd
 * @author roxgarage
 */

import { PixiComponent, useApp } from "@inlet/react-pixi";
import { Viewport as PixiViewport } from "pixi-viewport";
import * as PIXI from "pixi.js";
import React from "react";

export interface ViewportProps {
  width: number;
  height: number;
  children?: React.ReactNode;
}

export interface PixiComponentViewportProps extends ViewportProps {
  app: PIXI.Application;
}

const PixiComponentViewport = PixiComponent<
  PixiComponentViewportProps,
  PixiViewport
>("Viewport", {
  create: (props) =>
    new PixiViewport({
      screenWidth: props.width,
      screenHeight: props.height,
      worldWidth: props.width * 2,
      worldHeight: props.height * 2,
      ticker: props.app.ticker,
      interaction: props.app.renderer.plugins.interaction,
      stopPropagation: true,
    })
      .drag()
      .pinch()
      .wheel()
      .decelerate({ friction: 0.98 })
      .clampZoom({ maxScale: 10, minScale: 0.25 }),
  applyProps: (viewport, _, { width, height }) => {
    viewport.resize(width, height, width * 2, height * 2);
  },
});

const Viewport = (props: ViewportProps) => {
  const app = useApp();
  return <PixiComponentViewport app={app} {...props} />;
};

export default Viewport;
