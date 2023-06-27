import { TraceComponents } from "protocol/Trace";
import { RendererInbuiltViews } from "./RendererInbuiltViews";

const PixiGridView: TraceComponents = {
  "grid-view": [
    {
      $: "rect",
      width: 1,
      height: 1,
      x: "{{ctx.x}}",
      y: "{{ctx.y}}",
      drawPath: true,
    },
  ],
};

const PixiPolyanyaView: TraceComponents = {
  node: [
    {
      $: "circle",
      radius: 1,
      x: "{{ctx.x1}}",
      y: "{{ctx.y1}}",
      drawPath: true,
    },
  ],
  line1: [
    {
      $: "path",
      points: [
        {
          x: "{{ctx.x2}}",
          y: "{{ctx.y2}}",
        },
        {
          x: "{{ctx.x3}}",
          y: "{{ctx.y3}}",
        },
      ],
      lineWidth: 0.5,
    },
  ],
  line2: [
    {
      $: "path",
      points: [
        {
          x: "{{ctx.x1}}",
          y: "{{ctx.y1}}",
        },
        {
          x: "{{ctx.x2}}",
          y: "{{ctx.y2}}",
        },
      ],
      lineWidth: 0.5,
    },
  ],
  line3: [
    {
      $: "path",
      points: [
        {
          x: "{{ctx.x1}}",
          y: "{{ctx.y1}}",
        },
        {
          x: "{{ctx.x3}}",
          y: "{{ctx.y3}}",
        },
      ],
      lineWidth: 0.5,
    },
  ],
  triangle: [
    {
      $: "polygon",
      points: [
        {
          x: "{{ctx.x1}}",
          y: "{{ctx.y1}}",
        },
        {
          x: "{{ctx.x2}}",
          y: "{{ctx.y2}}",
        },
        {
          x: "{{ctx.x3}}",
          y: "{{ctx.y3}}",
        },
      ],
    },
  ],
  "polyanya-view": [
    {
      $: "node",
    },
    {
      $: "line1",
      persist: false,
    },
    {
      $: "line2",
      persist: false,
    },
    {
      $: "line3",
      persist: false,
    },
    {
      $: "triangle",
      persist: false,
    },
  ],
};

const PixiRoadView: TraceComponents = {
  node: [
    {
      $: "circle",
      radius: 0.3,
      x: "{{ctx.x}}",
      y: "{{ctx.y}}",
      drawPath: true,
    },
  ],
  line: [
    {
      $: "path",
      points: [
        {
          x: "{{ctx.parent.x}}",
          y: "{{ctx.parent.y}}",
        },
        {
          x: "{{ctx.x}}",
          y: "{{ctx.y}}",
        },
      ],
      lineWidth: 1,
    },
  ],
  "road-view": [
    {
      $: "node",
    },
    {
      $: "line",
    },
  ],
};

const PixiTreeView = {
  node: [
    {
      $: "circle",
      radius: 0.3,
      x: "{{ctx.x}}",
      y: "{{ctx.y}}",
      drawPath: true,
    },
  ],
  line: [
    {
      $: "path",
      points: [
        {
          x: "{{ctx.parent.x}}",
          y: "{{ctx.parent.y}}",
        },
        {
          x: "{{ctx.x}}",
          y: "{{ctx.y}}",
        },
      ],
      lineWidth: 1,
    },
  ],
  "tree-view": [
    {
      $: "node",
    },
    {
      $: "line",
    },
  ],
};

export const d2InbuiltViews: RendererInbuiltViews = {
  "2d-pixi": {
    "grid-view": PixiGridView,
    "polyanya-view": PixiPolyanyaView,
    "road-view": PixiRoadView,
    "tree-view": PixiTreeView,
  },
};
