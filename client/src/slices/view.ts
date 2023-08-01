import { nanoid as id } from "nanoid";
import { createSlice } from "./createSlice";

export type Layer<T = {}> = {
  key: string;
  name?: string;
  source?: { type: string } & T;
};

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
    type: "branch",
    key: id(),
    orientation: "horizontal",
    children: [
      {
        size: 75,
        type: "branch",
        key: id(),
        orientation: "horizontal",
        children: [
          {
            type: "leaf",
            size: 25,
            key: id(),
            content: { type: "layers" },
          },
          {
            size: 75,
            type: "branch",
            key: id(),
            orientation: "vertical",
            children: [
              {
                type: "leaf",
                size: 75,
                key: id(),
                content: { type: "viewport" },
              },
              {
                type: "leaf",
                size: 25,
                key: id(),
                content: { type: "info" },
              },
            ],
          },
        ],
      },
      {
        size: 25,
        type: "leaf",
        key: id(),
        content: { type: "steps" },
      },
    ],
  },
});
