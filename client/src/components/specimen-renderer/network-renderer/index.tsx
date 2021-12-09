import { blueGrey } from "@material-ui/core/colors";
import { constant } from "lodash";
import { BaseRasterRenderer } from "../base-raster-renderer/BaseRasterRenderer";
import { hex } from "../colors";
import { useMapInfo } from "../map-parser/useMapInfo";
import { scale } from "../planar-renderer/config";
import { line, square } from "../planar-renderer/Draw";
import { NodeList as Nodes } from "../planar-renderer/NodeList";
import { RendererProps } from "../Renderer";
import { parser } from "./parser";
import { transformer } from "./transformer";

export const vertOptions = { radius: 2 / scale };

export const edgeColor = constant(hex(blueGrey["100"]));
export const vertColor = constant(hex(blueGrey["500"]));

export function NetworkRenderer(props: RendererProps) {
  const info = useMapInfo({ parser, transformer });

  const {
    map: {
      nodes: { edges, verts },
    },
  } = info;

  return (
    <BaseRasterRenderer {...info} {...props}>
      <Nodes {...info} nodes={edges} color={edgeColor} variant={line} />
      <Nodes
        {...info}
        nodes={verts}
        color={vertColor}
        variant={square}
        options={vertOptions}
      />
    </BaseRasterRenderer>
  );
}
