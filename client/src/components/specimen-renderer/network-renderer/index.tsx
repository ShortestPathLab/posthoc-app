import { blueGrey } from "@material-ui/core/colors";
import { constant } from "lodash";
import { BaseRenderer } from "../base-renderer/BaseRenderer";
import { hex } from "../colors";
import { useMap } from "../map-parser/useMap";
import { scale } from "../planar-renderer/config";
import { line, square } from "../planar-renderer/Draw";
import { NodeList as Nodes } from "../planar-renderer/NodeList";
import { RendererProps } from "../Renderer";
import { parse } from "./parse";
import { normalize } from "./normalize";

export const vertOptions = { radius: 2 / scale };

export const edgeColor = constant(hex(blueGrey["100"]));
export const vertColor = constant(hex(blueGrey["500"]));

export function NetworkRenderer(props: RendererProps) {
  const info = useMap({ parse: parse, normalize: normalize });

  const {
    map: {
      nodes: { edges, verts },
    },
  } = info;

  return (
    <BaseRenderer {...info} {...props}>
      <Nodes {...info} nodes={edges} color={edgeColor} variant={line} />
      <Nodes
        {...info}
        nodes={verts}
        color={vertColor}
        variant={square}
        options={vertOptions}
      />
    </BaseRenderer>
  );
}
