import Split, { SplitDirection } from "@devbookhq/splitter";
import { DragIndicatorOutlined } from "@mui-symbols-material/w400";
import { Box, useTheme } from "@mui/material";
import { Block } from "components/generic/Block";
import {
  filter,
  find,
  flatMap,
  forEach,
  isUndefined,
  map,
  pick,
  sum,
  sumBy,
} from "lodash-es";
import { nanoid } from "nanoid";
import { produce } from "produce";
import {
  Context,
  createContext,
  ReactNode,
  Ref,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  createHtmlPortalNode,
  HtmlPortalNode,
  InPortal,
  OutPortal,
} from "react-reverse-portal";
import { useCss, useMap } from "react-use";
import { Transaction } from "slices/selector";
import { Branch, Leaf, Root } from "slices/view";
import { assert } from "utils/assert";
import { ViewControls } from "./ViewControls";
import { _ } from "utils/chain";

type TreeNode<S extends TreeNode = never> =
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

type ViewTreeContextType<T = unknown> = {
  isViewTree?: true;
  controls?: ReactNode;
  onChange?: (state: Transaction<T>) => void;
  state?: T;
  dragHandle?: ReactNode;
};

const ViewTreeContext = createContext<ViewTreeContextType>({});

export function useViewTreeContext<T = unknown>() {
  return useContext(
    ViewTreeContext as Context<ViewTreeContextType<T & { type: string }>>
  );
}

const ViewTreePortalsContext = createContext<
  Record<string, HtmlPortalNode | undefined>
>({});

type ViewTreeProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  defaultContent?: T;
  root?: Root<T>;
  renderLeaf?: (leaf: Leaf<T>) => ReactNode;
  onChange?: (root: Transaction<Root<T>>) => void;
  onClose?: () => void;
  depth?: number;
  onPopOut?: (leaf: Leaf<T>) => void;
  onMaximise?: (leaf: Leaf<T>) => void;
  canPopOut?: (leaf: Leaf<T>) => boolean;
  onDrop?: (leaf: Leaf<Record<string, unknown>>, root: Leaf<T>) => void;
};

type ViewBranchProps<T extends Record<string, unknown>> = ViewTreeProps<T> & {
  onSwap?: (a: string, b: string) => void;
};

type ViewLeafProps<T extends Record<string, unknown>> = ViewBranchProps<T> & {
  root?: Leaf<T>;
};

function handleSwap<T extends Record<string, unknown>>(
  root: Root<T>,
  a: string,
  b: string
) {
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

function getLeaves<T extends Record<string, unknown>>(
  root?: Root<T>
): Leaf<T>[] {
  return root
    ? root.type === "leaf"
      ? [root]
      : flatMap(root.children, getLeaves)
    : [];
}

function Panel<T extends Record<string, unknown>>({
  leaf: l,
  renderLeaf,
  onChange,
}: {
  onChange?: (a: string, v: HtmlPortalNode | undefined) => void;
  leaf: Leaf<T>;
  renderLeaf?: (leaf: Leaf<T>) => ReactNode;
}) {
  const portal = useMemo(
    () =>
      createHtmlPortalNode({
        attributes: { style: "width: 100%; height: 100%" },
      }),
    []
  );
  useEffect(() => {
    if (l.key && portal) {
      onChange?.(l.key, portal);
      return () => onChange?.(l.key, undefined);
    }
  }, [l.key, portal, onChange]);
  return (
    <InPortal node={portal}>
      <ViewTreeContext.Provider value={{}}>
        {renderLeaf?.(l)}
      </ViewTreeContext.Provider>
    </InPortal>
  );
}

export function ViewTree<T extends Record<string, unknown>>(
  props: ViewTreeProps<T>
) {
  const { onChange, root, renderLeaf } = props;
  const leaves = getLeaves(root);
  const [portals, { set }] =
    useMap<Record<string, HtmlPortalNode | undefined>>();
  return (
    <ViewTreePortalsContext.Provider value={portals}>
      <DndProvider backend={HTML5Backend}>
        <ViewBranch<T>
          {...props}
          onSwap={(a, b) => {
            if (root) {
              onChange?.((l) => produce(l, (r) => void handleSwap(r, a, b)));
            }
          }}
        />
        {map(leaves, (l) => (
          <Panel key={l.key} leaf={l} renderLeaf={renderLeaf} onChange={set} />
        ))}
      </DndProvider>
    </ViewTreePortalsContext.Provider>
  );
}

export function ViewLeaf<T extends Record<string, unknown>>({
  root = { type: "leaf", key: "" },
  onChange,
  onClose,
  onPopOut,
  onMaximise,
  canPopOut,
  depth = 0,
  onSwap,
  onDrop,
  defaultContent,
}: ViewLeafProps<T>) {
  const view = useContext(ViewTreePortalsContext);
  const [{ isOver }, drop] = useDrop<
    Leaf<Record<string, unknown>>,
    void,
    { isOver: boolean }
  >(() => ({
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
  }));
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "panel",
    item: root,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const context = useMemo(() => {
    const handleSplit = (orientation: "vertical" | "horizontal") =>
      onChange?.((l) =>
        produce(l, (draft) => {
          return {
            key: nanoid(),
            type: "branch",
            orientation,
            children: [
              { ...structuredClone(draft), size: 50, key: root.key },
              {
                type: "leaf",
                acceptDrop: true,
                content: defaultContent,
                size: 50,
                key: nanoid(),
              },
            ],
          } as Branch<T>;
        })
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
            <Box
              ref={drag as unknown as Ref<HTMLDivElement>}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <DragIndicatorOutlined
                fontSize="small"
                color="disabled"
                sx={{ mr: 0.5, cursor: "grab" }}
              />
            </Box>
          ),
          onChange: (c: Transaction<T>) =>
            onChange?.((l) => {
              assert(l.type === "leaf", "onChange is from leaf");
              l.content = produce(l?.content ?? ({} as T), c);
            }),
        } satisfies ViewTreeContextType<T>)
      : {};
  }, [onChange, onClose, depth, root, drag]);

  const portal = view[root.key];

  return (
    <Block
      ref={drop as unknown as Ref<HTMLDivElement>}
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
      {portal && <OutPortal node={portal} value={context} />}
    </Block>
  );
}

export function ViewBranch<T extends Record<string, unknown>>(
  props: ViewBranchProps<T>
) {
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
      "&:hover, &:active": {
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
    const all = _(
      root,
      (r) => r.map((c) => (isUndefined(c.size) || isNaN(c.size) ? 0 : c.size)),
      sum
    );
    return isUndefined(n) ? 100 - all || inferSize(root) : n;
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
              (l) =>
                void forEach(sizes, (size, i) => {
                  assert(l.type === "branch", "onChange is from branch");
                  l.children[i].size = size;
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
            c.hidden ? (
              <Box key="placeholder" />
            ) : (
              <ViewBranch
                {...props}
                key={c.key}
                depth={depth + 1}
                root={c}
                onChange={(f) =>
                  onChange?.((l) => {
                    assert(l.type === "branch", "onChange is from branch");
                    l.children[i] = produce(l.children[i], f);
                  })
                }
                onClose={() =>
                  onChange?.((draft): Root<T> => {
                    assert(draft.type === "branch", "root must be a branch");
                    draft.children.splice(i, 1);
                    if (draft.children.length === 1) {
                      return draft.children[0].type === "leaf"
                        ? {
                            type: "leaf",
                            key: draft.children[0].key,
                            content: draft.children[0].content,
                          }
                        : draft.children[0];
                    } else {
                      forEach(
                        draft.children,
                        (c, _, all) => (c.size = 100 / all.length)
                      );
                      return draft;
                    }
                  })
                }
              />
            )
          )}
        </Split>
      )}
    </>
  );
}
