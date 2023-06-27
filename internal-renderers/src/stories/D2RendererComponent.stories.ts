import { D2RendererComponent } from "./D2RendererComponent";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
export default {
  title: "Renderer/D2Renderer",
  component: D2RendererComponent,
  tags: ["autodocs"],
  argTypes: {
    resolution: { control: { type: "range", min: 1, max: 3, step: 1 } },
    threads: { control: { type: "number", min: 1, max: 64, step: 1 } },
    tileSize: { control: { type: "number", min: 1, max: 512, step: 1 } },
  },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary = {
  args: {
    resolution: 0,
  },
};
