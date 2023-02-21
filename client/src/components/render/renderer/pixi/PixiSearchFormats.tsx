import { TraceComponent } from "components/render/types/trace"
import { RendererSearchFormats } from "../primitives"

const PixiGridSF: TraceComponent[] = [{

  "$": "rect",
  "width": 1,
  "height": 1,
  "x": "{{x}}",
  "y": "{{y}}"

}]

const PixiMeshSF: TraceComponent[] = [

  {
    "$": "circle",
    "radius": 1,
    "x": "{{x1}}",
    "y": "{{y1}}"
  },
  {
    "$": "path",
    "points": [
      {
        "x": "{{x2}}",
        "y": "{{y2}}"
      },
      {
        "x": "{{x3}}",
        "y": "{{y3}}"
      }
    ]
  },
  {
    "$": "path",
    "points": [
      {
        "x": "{{x1}}",
        "y": "{{y1}}"
      },
      {
        "x": "{{x2}}",
        "y": "{{y2}}"
      }
    ]
  },
  {
    "$": "path",
    "points": [
      {
        "x": "{{x1}}",
        "y": "{{y1}}"
      },
      {
        "x": "{{x3}}",
        "y": "{{y3}}"
      }
    ]
  },
  {
    "$": "polygon",
    "points": [
      {
        "x": "{{x1}}",
        "y": "{{y1}}"
      },
      {
        "x": "{{x2}}",
        "y": "{{y2}}"
      },
      {
        "x": "{{x3}}",
        "y": "{{y3}}"
      }
    ],
    "persisted": false
  }
]

const PixiRoadSF: TraceComponent[] = [{
  "$": "circle",
  "radius": 0.3,
  "x": "{{x}}",
  "y": "{{y}}"
},
{
  "$": "path",
  "points": [
    {
      "x": "{{parent.x}}",
      "y": "{{parent.y}}"
    },
    {
      "x": "{{x}}",
      "y": "{{y}}"
    }
  ],
  "lineWidth": 1
}
]

const PixiTreeSF = {

}

export const d2SearchFormats: RendererSearchFormats = { "2d-pixi": { "grid-sf": PixiGridSF, "mesh-sf": PixiMeshSF, "road-sf": PixiRoadSF } }

