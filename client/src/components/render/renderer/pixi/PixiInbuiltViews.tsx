import { TraceComponents } from "components/render/types/trace"
import { RendererInbuiltViews } from "../primitives"

const PixiGridSF: TraceComponents = {
  "grid-view": [
    {
      "$": "rect",
      "width": 1,
      "height": 1,
      "x": "{{x}}",
      "y": "{{y}}"
    }
  ]
}

const PixiMeshSF: TraceComponents = {
  "node": [
    {
      "$": "circle",
      "radius": 1,
      "x": "{{x1}}",
      "y": "{{y1}}"
    }
  ],
  "line1": [
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
      ],
      "lineWidth" : 0.5
    }
  ],
  "line2": [
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
      ],
      "lineWidth" : 0.5
    }
  ],
  "line3": [
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
      ],
      "lineWidth" : 0.5
      
    }
  ],
  "triangle": [
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
  ],
  "mesh-view": [
    {
      "$": "node"
    },
    {
      "$": "line1"
    },
    {
      "$": "line2"
    },
    {
      "$": "line3"
    },
    {
      "$": "triangle"
    }
  ]
}

const PixiRoadSF: TraceComponents = {
  "node": [
    {
      "$": "circle",
      "radius": 0.3,
      "x": "{{x}}",
      "y": "{{y}}"
    }
  ],
  "line": [
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
      "lineWidth" : 1
    }
  ],
  "road-view":[
    {
        "$": "node"
      },
      {
        "$": "line"
      }
  ]
  
}

const PixiTreeSF = {
  "node": [
    {
      "$": "circle",
      "radius": 0.3,
      "x": "{{x}}",
      "y": "{{y}}"
    }
  ],
  "line": [
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
      "lineWidth" : 1
    }
  ],
  "tree-view":[
    {
        "$": "node"
      },
      {
        "$": "line"
      }
  ]
  
}

export const d2InbuiltViews: RendererInbuiltViews = { "2d-pixi": { "grid-view": PixiGridSF, "mesh-view": PixiMeshSF, "road-view": PixiRoadSF, "tree-view":PixiTreeSF } }

