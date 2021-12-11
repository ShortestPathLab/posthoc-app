import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { BaseRenderer } from "../base-renderer";
import { Path } from "../base-renderer/Path";
import { useMap } from "../map-parser/useMap";
import { line, square } from "../planar-renderer/Draw";
import { NodeList as Nodes } from "../planar-renderer/NodeList";
import { RendererProps } from "../Renderer";
import { normalize } from "./normalize";
import { edgeOptions, vertOptions } from "./options";
import { parse } from "./parse";

export function NetworkRenderer(props: RendererProps) {
  const [{ specimen }] = useSpecimen();
  const [{ step }] = useUIState();
  const info = useMap({ parse: parse, normalize: normalize });

  const {
    map: {
      nodes: { edges, verts },
    },
  } = info;

  return (
    <BaseRenderer {...info} {...props}>
      <Nodes nodes={edges} options={edgeOptions} variant={line} />
      <Nodes nodes={verts} options={vertOptions} variant={square} />
      <Path {...info} nodes={specimen?.eventList} step={step} />
    </BaseRenderer>
  );
}
