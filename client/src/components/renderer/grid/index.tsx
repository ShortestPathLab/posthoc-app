import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { BaseRenderer } from "../base";
import { Path } from "./Path";
import { useMap } from "../../../hooks/useMap";
import { NodeList as Nodes } from "../planar/NodeList";
import { RendererProps } from "../Renderer";
import { normalize } from "./normalize";
import { wallOptions } from "./options";
import { Overlay } from "./Overlay";
import { parse } from "./parse";

export function GridRenderer(props: RendererProps) {
  const [{ specimen }] = useSpecimen();
  const [{ start, end, step }] = useUIState();

  const info = useMap({ parse, normalize });

  const {
    map: {
      nodes: { walls },
    },
  } = info;

  return (
    <BaseRenderer
      {...info}
      {...props}
      overlay={[
        <Overlay start={start} end={end} />,
        <Path {...info} nodes={specimen?.eventList} step={step} />,
      ]}
    >
      <Nodes nodes={walls} options={wallOptions} />
    </BaseRenderer>
  );
}
