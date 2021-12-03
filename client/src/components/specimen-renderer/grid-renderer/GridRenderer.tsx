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
import { getDefaults } from "./getDefaults";
import { parseMap } from "./parseMap";

export type GridRendererProps = BaseRasterRendererProps;

export function GridRenderer(props: GridRendererProps) {
  const [{ map: m }] = useSpecimen();
  const [{ code, ...state }] = useUIState();

  const [map, bgNodeColor, { start, end }] = useMemo(
    () =>
      [
        parseMap(m),
        constant(hex(blueGrey["500"])),
        merge(getDefaults(m), { start: state.start, end: state.end }),
      ] as const,
    [m, state.start, state.end]
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
