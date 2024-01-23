import { Trace } from "protocol";

export const gridTemplate: Partial<Trace> = {
  version: "1.0.5",
  render: {
    context: {},
    components: {
      tile: [
        {
          $: "rect",
          width: 1,
          height: 1,
          x: "{{$.event.x}}",
          y: "{{$.event.y}}",
          fill: "{{$.color[$.event.type]}}",
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
      pivot: { x: "{{$.event.x + 0.5}}", y: "{{$.event.y + 0.5}}" },
      scale: 0.3,
    },
  },
};

export const xyTemplate: Partial<Trace> = {
  version: "1.0.5",
  render: {
    components: {
      node: [
        {
          $: "circle",
          fill: "{{$.color[$.event.type]}}",
          radius: 120,
          x: "{{$.event.x}}",
          y: "{{$.event.y}}",
        },
      ],
      line: [
        {
          $: "path",
          points: [
            {
              x: "{{$.parent ? $.parent.x: $.event.x}}",
              y: "{{$.parent ? $.parent.y: $.event.y}}",
            },
            {
              x: "{{$.event.x}}",
              y: "{{$.event.y}}",
            },
          ],
          fill: "{{$.color[$.event.type]}}",
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
      pivot: { x: "{{$.event.x}}", y: "{{$.event.y}}" },
      scale: 120,
    },
  },
};
