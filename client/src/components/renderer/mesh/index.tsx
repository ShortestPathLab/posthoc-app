import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { PlanarRenderer } from "../planar";
import { useMap } from "../../../hooks/useMap";
import { tri } from "../raster/Draw";
import { LazyNodeList as LazyNodes } from "../raster/NodeList";
import { RendererProps } from "../Renderer";
import { normalize } from "./normalize";
import { progressOptions, shadowOptions } from "./options";
import { parse } from "./parse";
import { Path } from "./Path";

export function MeshRenderer(props: RendererProps) {
  const [{ specimen }] = useSpecimen();
  const [{ step }] = useUIState();

  const info = useMap({ parse, normalize });

  return (
    <PlanarRenderer
      {...info}
      {...props}
      ShadowProps={{ variant: tri, options: shadowOptions }}
      ProgressProps={{ variant: tri, options: progressOptions }}
    >
      <LazyNodes
        {...info}
        nodes={specimen?.eventList}
        step={step}
        options={progressOptions}
      />
      <Path {...info} nodes={specimen?.eventList} step={step} />
    </PlanarRenderer>
  );
}
