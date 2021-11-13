import { Stage } from "@inlet/react-pixi";
import { Box } from "@material-ui/core";
import { ComponentProps, forwardRef, ReactNode } from "react";
import { RendererProps } from "../Renderer";
import { Viewport } from "../raster-renderer/Viewport";

type RasterRendererProps = RendererProps & {
  children?: ReactNode;
  StageProps?: ComponentProps<typeof Stage>;
  ViewportProps?: ComponentProps<typeof Viewport>;
};

export const RasterRenderer = forwardRef<unknown, RasterRendererProps>(
  ({ children, width, height, ViewportProps, StageProps }, ref) => (
    <Box sx={{ cursor: "pointer" }} ref={ref}>
      <Stage options={{ backgroundColor: 0xffffff }} {...StageProps}>
        <Viewport width={width} height={height} {...ViewportProps}>
          {children}
        </Viewport>
      </Stage>
    </Box>
  )
);
