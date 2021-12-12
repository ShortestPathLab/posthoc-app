import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { BaseRenderer } from "../base";
import { Path } from "./Path";
import { Overlay } from "./Overlay";
import { useMap } from "../../../hooks/useMap";
import { line, square } from "../planar/Draw";
import { NodeList as Nodes } from "../planar/NodeList";
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
    <BaseRenderer
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
    </BaseRenderer>
  );
}
