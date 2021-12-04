import { blueGrey } from "@material-ui/core/colors";
import { constant, merge } from "lodash";
import { useMemo } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import {
  BaseRasterRenderer,
  BaseRasterRendererProps,
} from "../base-raster-renderer/BaseRasterRenderer";
import { hex } from "../colors";
import { NodeList as Nodes } from "../raster-renderer/NodeList";
import { Overlay } from "../raster-renderer/Overlay";
import { parser } from "./parser";

export type GridRendererProps = BaseRasterRendererProps;

export function GridRenderer(props: GridRendererProps) {
  const [{ map: m }] = useSpecimen();
  const [{ code, start, end }] = useUIState();

  const [map, bgNodeColor] = useMemo(
    () => [parser(m), constant(hex(blueGrey["500"]))] as const,
    [m]
  );

  const {
    size,
    nodes: { walls },
  } = map;

  return (
    <BaseRasterRenderer {...props} {...map}>
      <Nodes nodes={walls} color={bgNodeColor} />
      <Overlay start={start} end={end} size={size} />
    </BaseRasterRenderer>
  );
}
