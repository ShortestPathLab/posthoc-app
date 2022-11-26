import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { PlanarRenderer } from "../planar";
import { Path } from "./Path";
import { useMap } from "hooks/useMap";
import { NodeList as Nodes } from "../raster/NodeList";
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
    <PlanarRenderer
      {...info}
      {...props}
      overlay={[
        <Overlay start={start} end={end} />,
        <Path {...info} nodes={specimen?.eventList} step={step} />,
      ]}
    >
      <Nodes nodes={walls} options={wallOptions} />
    </PlanarRenderer>
  );
}
