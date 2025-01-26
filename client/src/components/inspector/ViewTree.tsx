import Split, { SplitDirection } from "@devbookhq/splitter";
import { DragIndicatorOutlined } from "@mui-symbols-material/w400";
import { Box, useTheme } from "@mui/material";
import { Flex } from "components/generic/Flex";
import {
  chain as _,
  filter,
  find,
  flatMap,
  forEach,
  isUndefined,
  map,
  pick,
  sumBy,
} from "lodash";
import { nanoid } from "nanoid";
import { produce, transaction } from "produce";
import { Context, ReactNode, createContext, useContext, useMemo } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useCss } from "react-use";
import { Leaf, Root } from "slices/view";
import { ViewControls } from "./ViewControls";

type TreeNode<S extends TreeNode = any> =
  | {
      children?: S[];
    }
  | object;

function findInTree<T extends TreeNode<T>>(
  data: T,
  iterator: (a: T) => boolean
): T | undefined {
  const f = (a: T): T[] =>
    "children" in a && a.children?.length ? flatMap(a.children, f) : [a];
  return find(f(data), iterator);
}

type ViewTreeContextType<T = any> = {
  isViewTree?: true;
  controls?: ReactNode;
  onChange?: (state: Partial<T>) => void;
  state?: T;
  dragHandle?: ReactNode;
};

const ViewTreeContext = createContext<ViewTreeContextType>({});

export function useViewTreeContext<T = any>() {
  return useContext(
    ViewTreeContext as Context<ViewTreeContextType<T & { type: string }>>
  );
}

type ViewTreeProps<T> = {
  root?: Root<T>;
  renderLeaf?: (leaf: Leaf<T>) => ReactNode;
  onChange?: (root: Root<T>) => void;
  onClose?: () => void;
  depth?: number;
  onPopOut?: (leaf: Leaf<T>) => void;
  onMaximise?: (leaf: Leaf<T>) => void;
  canPopOut?: (leaf: Leaf<T>) => boolean;
  onDrop?: (leaf: Leaf<any>, root: Leaf<T>) => void;
};

type ViewBranchProps<T> = ViewTreeProps<T> & {
  onSwap?: (a: string, b: string) => void;
};

type ViewLeafProps<T> = ViewBranchProps<T> & { root?: Leaf<T> };

function handleSwap<T>(root: Root<T>, a: string, b: string) {
  const leafA = findInTree(root, (c) => c.key === a);
  const leafB = findInTree(root, (c) => c.key === b);
  if (leafA?.type === "leaf" && leafB?.type === "leaf") {
    const deltaA = pick(leafA, "content", "key");
    const deltaB = pick(leafB, "content", "key");
    Object.assign(leafA, deltaB);
    Object.assign(leafB, deltaA);
  }
  return root;
}
export function ViewTree<T>(props: ViewTreeProps<T>) {
  const { onChange, root } = props;
  return (
    <DndProvider backend={HTML5Backend}>
      <ViewBranch<T>
        {...props}
        onSwap={(a, b) => {
          if (root) {
            onChange?.(produce(root, (root) => handleSwap(root, a, b)));
          }
        }}
      />
    </DndProvider>
  );
}

export function ViewLeaf<T>({
  root = { type: "leaf", key: "" },
  renderLeaf,
  onChange,
  onClose,
  onPopOut,
  onMaximise,
  canPopOut,
  depth = 0,
  onSwap,
  onDrop,
}: ViewLeafProps<T>) {
  const [{ isOver }, drop] = useDrop<Leaf<any>, void, { isOver: boolean }>(
    () => ({
      accept: ["panel"],
      collect: (monitor) => ({
        isOver:
          monitor.isOver() &&
          monitor.getItem().key !== root.key &&
          !!root.acceptDrop,
      }),
      drop: (item) => {
        onDrop?.(item, root);
        onSwap?.(item.key, root.key);
      },
    })
  );
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "panel",
    item: root,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const context = useMemo(() => {
    const handleSplit = (orientation: "vertical" | "horizontal") =>
      onChange?.(
        transaction(root, (draft) => ({
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
      ? ({
          isViewTree: true,
          state: root.content,
          controls: (
            <ViewControls
              onClose={onClose}
              closeDisabled={!depth}
              onSplitHorizontal={() => handleSplit("horizontal")}
              onSplitVertical={() => handleSplit("vertical")}
              onPopOut={() => {
                onPopOut?.(root);
              }}
              onMaximise={() => {
                onMaximise?.(root);
              }}
              popOutDisabled={!canPopOut?.(root)}
            />
          ),
          dragHandle: (
            <Box ref={drag} sx={{ display: "flex", alignItems: "center" }}>
              <DragIndicatorOutlined
                fontSize="small"
                color="disabled"
                sx={{ mr: 0.5, cursor: "grab" }}
              />
            </Box>
          ),
          onChange: (c: any) =>
            onChange?.(
              produce(root, (draft) => {
                draft.content = { ...draft.content, ...c };
              })
            ),
        } satisfies ViewTreeContextType<T>)
      : {};
  }, [onChange, onClose, depth, root, drag]);

  return (
    <>
      <Flex
        ref={drop}
        sx={{
          overflow: "hidden",
          "::before": {
            pointerEvents: "none",
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            boxShadow: (t) =>
              isOver ? `inset 0 0 0 2px ${t.palette.primary.main}` : "none",
            transition: (t) => t.transitions.create("box-shadow"),
          },
          transition: (t) => t.transitions.create("opacity"),
          opacity: (t) => (isDragging ? t.palette.action.disabledOpacity : 1),
        }}
      >
        <ViewTreeContext.Provider value={context}>
          {renderLeaf?.(root)}
        </ViewTreeContext.Provider>
      </Flex>
    </>
  );
}

export function ViewBranch<T>(props: ViewBranchProps<T>) {
  const { root = { type: "leaf", key: "" }, onChange, depth = 0 } = props;
  const { palette, spacing, transitions } = useTheme();
  const isLocked = root.type === "branch" && root.locked;

  const dragCls = useCss({
    ...(isLocked && { display: "none" }),
    "div&": {
      background: palette.text.secondary,
      opacity: 0.5,
      transition: transitions.create("opacity"),
      "&.Horizontal": { width: "3px" },
      "&.Vertical": { height: "3px" },
    },
  });

  const gutterCls = useCss({
    ...(isLocked && { pointerEvents: "none" }),
    "div&": {
      background:
        palette.mode === "dark" ? palette.background.default : palette.divider,
      boxShadow: `inset 0 0 0 1px ${palette.background.paper}`,
      "&:hover": {
        background: palette.primary.main,
        boxShadow: "none",
      },
      "&.Horizontal": {
        padding: 0,
        width: "3px",
      },
      "&.Vertical": { padding: 0 },
    },
  });

  const getSpacing = (n: number) => Number(spacing(n).slice(0, -2));

  function inferSize(all: Root<T>[]) {
    const space = 100 - sumBy(all, "size");
    const undef = filter(all, (s) => !s.size).length;
    return undef ? space / undef : 0;
  }

  function share(n?: number, root: Root<T>[] = []) {
    const all = _(root)
      .map((c) => (isUndefined(c.size) || isNaN(c.size) ? 0 : c.size))
      .sum()
      .value();
    return !isUndefined(n) ? n : 100 - all || inferSize(root);
  }

  return (
    <>
      {root.type === "leaf" ? (
        <ViewLeaf<T> {...(props as ViewLeafProps<T>)} />
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
          minHeights={map(root.children, () => getSpacing(6) - 8)}
          minWidths={map(root.children, () => getSpacing(32))}
          initialSizes={map(root.children, (c, _, all) => share(c.size, all))}
          direction={
            {
              vertical: SplitDirection.Vertical,
              horizontal: SplitDirection.Horizontal,
            }[root.orientation as "vertical" | "horizontal"]
          }
        >
          {map(root.children, (c, i) =>
            !c.hidden ? (
              <ViewBranch
                {...props}
                key={c.key}
                depth={depth + 1}
                root={c}
                onChange={(newChild) =>
                  onChange?.(
                    produce(root, (draft) => (draft.children[i] = newChild))
                  )
                }
                onClose={() =>
                  onChange?.(
                    transaction(root, (draft) => {
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
            ) : (
              <Box key="placeholder" />
            )
          )}
        </Split>
      )}
    </>
  );
}
