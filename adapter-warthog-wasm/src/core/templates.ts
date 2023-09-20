import { Trace } from "protocol";

export const gridTemplate: Partial<Trace> = {
  version: "1.0.4",
  render: {
    context: {},
    components: {
      tile: [
        {
          $: "rect",
          width: 1,
          height: 1,
          x: "{{ctx.x}}",
          y: "{{ctx.y}}",
          fill: "{{ctx.color[ctx.type]}}",
        },
      ],
    },
    views: {
      main: {
        components: [
          {
            $: "tile",
          },
        ],
      },
    },
    path: {
      pivot: { x: "{{ctx.x + 0.5}}", y: "{{ctx.y + 0.5}}" },
      scale: 0.3,
    },
  },
};

export const xyTemplate: Partial<Trace> = {
  version: "1.0.4",
  render: {
    components: {
      node: [
        {
          $: "circle",
          fill: "{{ctx.color[ctx.type]}}",
          radius: 120,
          x: "{{ctx.x}}",
          y: "{{ctx.y}}",
        },
      ],
      line: [
        {
          $: "path",
          points: [
            {
              x: "{{ctx.parent ? ctx.parent.x: ctx.x}}",
              y: "{{ctx.parent ? ctx.parent.y: ctx.y}}",
            },
            {
              x: "{{ctx.x}}",
              y: "{{ctx.y}}",
            },
          ],
          fill: "{{ctx.color[ctx.type]}}",
          lineWidth: 90,
        },
      ],
      "road-event": [
        {
          $: "node",
        },
        {
          $: "line",
        },
      ],
    },
    views: {
      main: {
        renderer: "2d-pixi",
        components: [{ $: "road-event" }],
      },
    },
    path: {
      pivot: { x: "{{ctx.x}}", y: "{{ctx.y}}" },
      scale: 120,
    },
  },
};
