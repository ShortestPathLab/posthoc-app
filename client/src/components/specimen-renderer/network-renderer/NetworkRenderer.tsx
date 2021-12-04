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
import { scale } from "../raster-renderer/config";
import { line, square } from "../raster-renderer/Draw";
import { NodeList as Nodes } from "../raster-renderer/NodeList";
import { Overlay } from "../raster-renderer/Overlay";
import { parser } from "./parser";

type NetworkRendererProps = BaseRasterRendererProps;

const vertOptions = { radius: 2 / scale };

export function NetworkRenderer(props: NetworkRendererProps) {
  const [{ map: m }] = useSpecimen();
  const [{ start, end }] = useUIState();

  const [map, edgeColor, vertColor] = useMemo(
    () =>
      [
        parser(m),
        constant(hex(blueGrey["100"])),
        constant(hex(blueGrey["500"])),
      ] as const,
    [m]
  );

  const {
    size,
    nodes: { edges, verts },
  } = map;

  return (
    <BaseRasterRenderer {...props} {...map}>
      <Nodes nodes={edges} color={edgeColor} variant={line} />
      <Nodes
        nodes={verts}
        color={vertColor}
        variant={square}
        options={vertOptions}
      />
      <Overlay start={start} end={end} size={size} />
    </BaseRasterRenderer>
  );
}
