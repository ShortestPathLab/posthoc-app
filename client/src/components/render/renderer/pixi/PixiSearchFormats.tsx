import { TraceComponents } from "components/render/types/trace"
import { RendererSearchFormats } from "../primitives"

const PixiGridSF: TraceComponents = {
  "grid-sf": [
    {
      "$": "rect",
      "width": 1,
      "height": 1,
      "x": "{{x}}",
      "y": "{{y}}"
    }
  ]
}

const PixiMeshSF: TraceComponents = {}

const PixiRoadSF: TraceComponents = {}

const PixiTreeSF = {

}

export const d2SearchFormats: RendererSearchFormats = { "2d-pixi": { "grid-sf": PixiGridSF, "mesh-sf": PixiMeshSF, "road-sf": PixiRoadSF } }

