import { TraceComponents } from "protocol/Trace"
import { RendererInbuiltViews } from "../primitives"

const PixiGridView: TraceComponents = {
  "grid-view": [
    {
      "$": "rect",
      "width": 1,
      "height": 1,
      "x": "{{x}}",
      "y": "{{y}}",
      "drawPath": true,
    }
  ]
}

const PixiPolyanyaView: TraceComponents = {
  "node": [
    {
      "$": "circle",
      "radius": 1,
      "x": "{{x1}}",
      "y": "{{y1}}",
      "drawPath": true,
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
      ]
    }
  ],
  "polyanya-view": [
    {
      "$": "node"
    },
    {
      "$": "line1",
      "persist": false
    },
    {
      "$": "line2",
      "persist": false
    },
    {
      "$": "line3",
      "persist": false
    },
    {
      "$": "triangle",
      "persist": false
    }
  ]
}

const PixiRoadView: TraceComponents = {
  "node": [
    {
      "$": "circle",
      "radius": 0.3,
      "x": "{{x}}",
      "y": "{{y}}",
      "drawPath": true,
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

const PixiTreeView = {
  "node": [
    {
      "$": "circle",
      "radius": 0.3,
      "x": "{{x}}",
      "y": "{{y}}",
      "drawPath": true,
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

export const d2InbuiltViews: RendererInbuiltViews = { "2d-pixi": { "grid-view": PixiGridView, "polyanya-view": PixiPolyanyaView, "road-view": PixiRoadView, "tree-view":PixiTreeView } }

