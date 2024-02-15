import { nanoid as id } from "nanoid";
import { createSlice } from "./createSlice";

export type Node = { size?: number };

export type Branch<T> = Node & {
  type: "branch";
  key: string;
  orientation: "vertical" | "horizontal";
  children: Root<T>[];
};

export type Leaf<T> = Node & {
  type: "leaf";
  key: string;
  content?: T;
};

export type Root<T> = Branch<T> | Leaf<T>;

export type ViewTreeState = { view: Root<PanelState> };

export type PanelState = {
  type: string;
};

export const [useView, ViewProvider] = createSlice<
  ViewTreeState,
  Partial<ViewTreeState>
>({
  view: {
    key: id(),
    type: "branch",
    orientation: "horizontal",
    children: [
      { key: id(), type: "leaf", size: 20, content: { type: "explore" } },
      {
        size: 80,
        type: "branch",
        key: id(),
        orientation: "horizontal",
        children: [
          {
            type: "branch",
            key: id(),
            orientation: "vertical",
            size: 25,
            children: [
              {
                type: "leaf",
                size: 40,
                key: id(),
                content: { type: "layers" },
              },
              {
                type: "leaf",
                size: 60,
                key: id(),
                content: { type: "steps" },
              },
            ],
          },
          {
            size: 75,
            type: "leaf",
            key: id(),
            content: { type: "viewport" },
          },
        ],
      },
    ],
  },
});
