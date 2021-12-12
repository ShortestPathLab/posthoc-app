import { Stage } from "@inlet/react-pixi";
import { Box, BoxProps } from "@material-ui/core";
import { ComponentProps, forwardRef, ReactNode } from "react";
import { Viewport } from "./Viewport";
import { RendererProps } from "../Renderer";

type RasterRendererProps = RendererProps & {
  children?: ReactNode;
  StageProps?: ComponentProps<typeof Stage>;
  ViewportProps?: ComponentProps<typeof Viewport>;
  BoxProps?: BoxProps;
};

export const RasterRenderer = forwardRef<unknown, RasterRendererProps>(
  ({ children, width, height, ViewportProps, StageProps, BoxProps }, ref) => (
    <Box {...BoxProps} ref={ref}>
      <Stage
        options={{
          backgroundColor: 0xffffff,
          autoDensity: true,
          clearBeforeRender: false,
          resolution: 1,
          antialias: true,
        }}
        {...StageProps}
      >
        <Viewport width={width} height={height} {...ViewportProps}>
          {children}
        </Viewport>
      </Stage>
    </Box>
  )
);
