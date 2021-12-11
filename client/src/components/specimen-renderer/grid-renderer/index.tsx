import { blueGrey } from "@material-ui/core/colors";
import { constant } from "lodash";
import { useUIState } from "slices/UIState";
import { BaseRenderer } from "../base-renderer/BaseRenderer";
import { hex } from "../colors";
import { useMap } from "../map-parser/useMap";
import { NodeList as Nodes } from "../planar-renderer/NodeList";
import { RendererProps } from "../Renderer";
import { Overlay } from "./Overlay";
import { parse } from "./parse";
import { normalize } from "./normalize";

const wallColor = constant(hex(blueGrey["500"]));

export function GridRenderer(props: RendererProps) {
  const [{ start, end }] = useUIState();

  const info = useMap({ parse, normalize });

  const {
    map: {
      nodes: { walls },
    },
  } = info;

  return (
    <BaseRenderer {...info} {...props}>
      <Nodes {...info} nodes={walls} color={wallColor} />
      <Overlay {...info} start={start} end={end} />
    </BaseRenderer>
  );
}
