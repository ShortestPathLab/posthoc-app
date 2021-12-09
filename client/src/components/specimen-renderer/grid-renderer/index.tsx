import { blueGrey } from "@material-ui/core/colors";
import { constant } from "lodash";
import { useUIState } from "slices/UIState";
import { BaseRasterRenderer } from "../base-raster-renderer/BaseRasterRenderer";
import { hex } from "../colors";
import { useMapInfo } from "../map-parser/useMapInfo";
import { NodeList as Nodes } from "../planar-renderer/NodeList";
import { RendererProps } from "../Renderer";
import { Overlay } from "./Overlay";
import { parser } from "./parser";
import { transformer } from "./transformer";

const wallColor = constant(hex(blueGrey["500"]));

export function GridRenderer(props: RendererProps) {
  const [{ start, end }] = useUIState();

  const info = useMapInfo({ parser, transformer });

  const {
    map: {
      nodes: { walls },
    },
  } = info;

  return (
    <BaseRasterRenderer {...info} {...props}>
      <Nodes {...info} nodes={walls} color={wallColor} />
      <Overlay {...info} start={start} end={end} />
    </BaseRasterRenderer>
  );
}
