import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { BaseRenderer } from "../base-renderer";
import { useMap } from "../map-parser/useMap";
import { tri } from "../planar-renderer/Draw";
import { LazyNodeList as LazyNodes } from "../planar-renderer/NodeList";
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
    <BaseRenderer
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
    </BaseRenderer>
  );
}
