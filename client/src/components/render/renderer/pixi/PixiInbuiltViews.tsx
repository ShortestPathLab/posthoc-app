import { TraceComponents } from "protocol/Trace"
import { RendererInbuiltViews } from "../primitives"

const PixiGridView: TraceComponents = {
  "grid-view": [
    {
      "$": "rect",
      "width": 1,
      "height": 1,
      "x": "{{execon.x}}",
      "y": "{{execon.y}}",
      "drawPath": true,
    }
  ]
}

const PixiPolyanyaView: TraceComponents = {
  "node": [
    {
      "$": "circle",
      "radius": 1,
      "x": "{{execon.x1}}",
      "y": "{{execon.y1}}",
      "drawPath": true,
    }
  ],
  "line1": [
    {
      "$": "path",
      "points": [
        {
          "x": "{{execon.x2}}",
          "y": "{{execon.y2}}"
        },
        {
          "x": "{{execon.x3}}",
          "y": "{{execon.y3}}"
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
          "x": "{{execon.x1}}",
          "y": "{{execon.y1}}"
        },
        {
          "x": "{{execon.x2}}",
          "y": "{{execon.y2}}"
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
          "x": "{{execon.x1}}",
          "y": "{{execon.y1}}"
        },
        {
          "x": "{{execon.x3}}",
          "y": "{{execon.y3}}"
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
          "x": "{{execon.x1}}",
          "y": "{{execon.y1}}"
        },
        {
          "x": "{{execon.x2}}",
          "y": "{{execon.y2}}"
        },
        {
          "x": "{{execon.x3}}",
          "y": "{{execon.y3}}"
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
      "x": "{{execon.x}}",
      "y": "{{execon.y}}",
      "drawPath": true,
    }
  ],
  "line": [
    {
      "$": "path",
      "points": [
        {
          "x": "{{execon.parent.x}}",
          "y": "{{execon.parent.y}}"
        },
        {
          "x": "{{execon.x}}",
          "y": "{{execon.y}}"
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
      "x": "{{execon.x}}",
      "y": "{{execon.y}}",
      "drawPath": true,
    }
  ],
  "line": [
    {
      "$": "path",
      "points": [
        {
          "x": "{{execon.parent.x}}",
          "y": "{{execon.parent.y}}"
        },
        {
          "x": "{{execon.x}}",
          "y": "{{execon.y}}"
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

