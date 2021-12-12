import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { PlanarRenderer } from "../planar";
import { Path } from "./Path";
import { Overlay } from "./Overlay";
import { useMap } from "../../../hooks/useMap";
import { line, square } from "../raster/Draw";
import { NodeList as Nodes } from "../raster/NodeList";
import { RendererProps } from "../Renderer";
import { normalize } from "./normalize";
import {
  edgeOptions,
  progressOptions,
  shadowOptions,
  vertOptions,
} from "./options";
import { parse } from "./parse";

export function NetworkRenderer(props: RendererProps) {
  const [{ specimen }] = useSpecimen();
  const [{ start, end, step }] = useUIState();
  const info = useMap({ parse, normalize });

  const {
    map: {
      nodes: { edges, verts },
    },
  } = info;

  return (
    <PlanarRenderer
      {...info}
      {...props}
      ShadowProps={{ options: shadowOptions }}
      ProgressProps={{ options: progressOptions }}
      overlay={[
        <Overlay start={start} end={end} />,
        <Path {...info} nodes={specimen?.eventList} step={step} />,
      ]}
    >
      <Nodes nodes={edges} options={edgeOptions} variant={line} />
      <Nodes nodes={verts} options={vertOptions} variant={square} />
    </PlanarRenderer>
  );
}
