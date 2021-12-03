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
import { getDefaults } from "./getDefaults";
import { parseMap } from "./parseMap";

type NetworkRendererProps = BaseRasterRendererProps;

const vertOptions = { radius: 2 / scale };

export function NetworkRenderer(props: NetworkRendererProps) {
  const [{ map: m }] = useSpecimen();
  const [{ code, ...state }] = useUIState();

  const [
    {
      size,
      nodes: { edges, verts },
      resolve,
      getNode,
    },
    edgeColor,
    vertColor,
    { start, end },
  ] = useMemo(
    () =>
      [
        parseMap(m),
        constant(hex(blueGrey["100"])),
        constant(hex(blueGrey["500"])),
        merge(getDefaults(m), { start: state.start, end: state.end }),
      ] as const,
    [m, state.start, state.end]
  );

  return (
    <BaseRasterRenderer {...{ ...props, size, resolve, getNode }}>
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
