import Split, { SplitDirection } from "@devbookhq/splitter";
import { useTheme } from "@mui/material";
import { filter, forEach, map, sumBy } from "lodash";
import { nanoid } from "nanoid";
import { useCss } from "react-use";
import { Context, createContext, ReactNode, useContext, useMemo } from "react";
import { ViewControls } from "./ViewControls";
import { Flex } from "components/generic/Flex";
import { produce, produce2 } from "produce";
import { Leaf, Root } from "slices/view";

type ViewTreeContextType<T = any> = {
  controls?: ReactNode;
  onChange?: (state: Partial<T>) => void;
  state?: T;
};

const ViewTreeContext = createContext<ViewTreeContextType>({});

export function useViewTreeContext<T = any>() {
  return useContext(ViewTreeContext as Context<ViewTreeContextType<T>>);
}

type ViewTreeProps<T> = {
  root?: Root<T>;
  renderLeaf?: (leaf: Leaf<T>) => ReactNode;
  onChange?: (root: Root<T>) => void;
  onClose?: () => void;
  depth?: number;
};

export function ViewTree<T>({
  root = { type: "leaf", key: "" },
  renderLeaf,
  onChange,
  onClose,
  depth = 0,
}: ViewTreeProps<T>) {
  const { palette, spacing, transitions } = useTheme();

  const dragCls = useCss({
    "div&": {
      background: palette.text.secondary,
      opacity: 1 - palette.action.activatedOpacity,
      transition: transitions.create("opacity"),
      "&.Horizontal": { width: "3px" },
      "&.Vertical": { height: "3px" },
    },
  });

  const gutterCls = useCss({
    "div&": {
      background: palette.background.default,
      [`&:hover .${dragCls}`]: { opacity: 1 },
      "&.Horizontal": { padding: 0 },
      "&.Vertical": { padding: 0 },
    },
  });

  const getSpacing = (n: number) => Number(spacing(n).slice(0, -2));

  function inferSize(all: Root<T>[]) {
    const space = 100 - sumBy(all, "size");
    const undef = filter(all, (s) => !s.size).length;
    return undef ? space / undef : 0;
  }

  const context = useMemo(() => {
    const handleSplit = (orientation: "vertical" | "horizontal") =>
      onChange?.(
        produce2(root, (draft) => ({
          key: nanoid(),
          type: "branch",
          orientation,
          children: [
            { ...structuredClone(draft), size: 50, key: nanoid() },
            { ...structuredClone(draft), size: 50, key: nanoid() },
          ],
        }))
      );

    return root.type === "leaf"
      ? {
          state: root.content,
          controls: (
            <ViewControls
              onClose={onClose}
              closeDisabled={!depth}
              onSplitHorizontal={() => handleSplit("horizontal")}
              onSplitVertical={() => handleSplit("vertical")}
            />
          ),
          onChange: (c: any) =>
            onChange?.(
              produce(root, (draft) => {
                draft.content = { ...draft.content, ...c };
              })
            ),
        }
      : {};
  }, [onChange, onClose, depth, root]);

  return (
    <>
      {root.type === "leaf" ? (
        <Flex>
          <Flex sx={{ borderRadius: (t) => t.spacing(1), overflow: "hidden" }}>
            <ViewTreeContext.Provider value={context}>
              {renderLeaf?.(root)}
            </ViewTreeContext.Provider>
          </Flex>
        </Flex>
      ) : (
        <Split
          gutterClassName={gutterCls}
          draggerClassName={dragCls}
          onResizeFinished={(_, sizes) =>
            onChange?.(
              produce(root, (draft) => {
                forEach(sizes, (size, i) => {
                  draft.children[i].size = size;
                });
              })
            )
          }
          minHeights={map(root.children, () => getSpacing(6) - 11)}
          minWidths={map(root.children, () => getSpacing(32))}
          initialSizes={map(
            root.children,
            (c, _, all) => c.size ?? inferSize(all)
          )}
          direction={
            {
              vertical: SplitDirection.Vertical,
              horizontal: SplitDirection.Horizontal,
            }[root.orientation as "vertical" | "horizontal"]
          }
        >
          {map(root.children, (c, i) => (
            <ViewTree
              key={c.key}
              depth={depth + 1}
              renderLeaf={renderLeaf}
              root={c}
              onChange={(newChild) =>
                onChange?.(
                  produce(root, (draft) => (draft.children[i] = newChild))
                )
              }
              onClose={() =>
                onChange?.(
                  produce2(root, (draft) => {
                    draft.children.splice(i, 1);
                    if (draft.children.length === 1) {
                      if (draft.children[0].type === "leaf") {
                        return {
                          type: "leaf",
                          key: nanoid(),
                          content: draft.children[0].content,
                        };
                      } else {
                        return draft.children[0];
                      }
                    } else {
                      forEach(
                        draft.children,
                        (c, _, all) => (c.size = 100 / all.length)
                      );
                      return draft;
                    }
                  })
                )
              }
            />
          ))}
        </Split>
      )}
    </>
  );
}
