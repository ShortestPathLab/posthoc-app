import { nanoid as id } from "nanoid";
import { createSlice } from "./createSlice";
import { once } from "lodash";
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

const isSm = once(() => window.innerWidth < 640);

export const [useView, ViewProvider] = createSlice<
  ViewTreeState,
  Partial<ViewTreeState>
>(
  isSm()
    ? {
        view: {
          key: id(),
          type: "leaf",
          size: 100,
          content: { type: "explore" },
        },
      }
    : {
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
      }
);
