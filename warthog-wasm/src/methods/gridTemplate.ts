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
