import { Box, BoxProps, useTheme } from "@mui/material";
import {
  ComponentProps,
  ForwardedRef,
  ReactElement,
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useCss } from "react-use";

import { useOverlayScrollbars } from "overlayscrollbars-react";
import {
  VirtuosoHandle as Handle,
  Virtuoso as List,
  VirtuosoProps as ListProps,
  VirtuosoHandle,
} from "react-virtuoso";

// const Scroller = forwardRef<HTMLDivElement, ScrollerProps>(
//   ({ style, ...props }, ref) => {
//     const { spacing } = useTheme();
// const cls = useCss({
//   "> .os-scrollbar-vertical > .os-scrollbar-track > .os-scrollbar-handle": {
//     "min-height": spacing(12),
//   },
// });
//     return (
//       <Scroll
//         y
//         className={cls}
//         style={{ width: "100%", height: "100%" }}
//         {...props}
//         ref={ref}
//       />
//     );
//   }
// );

function Scroller(
  { style, children, ...rest }: ComponentProps<"div">,
  ref: ForwardedRef<HTMLDivElement>
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { palette, spacing } = useTheme();
  const cls = useCss({
    "--os-padding-perpendicular": "2px",
    ".os-scrollbar": { visibility: "visible", opacity: 1 },
    ".os-scrollbar-vertical > .os-scrollbar-track > .os-scrollbar-handle": {
      "min-height": spacing(12),
    },
    "div.os-scrollbar-vertical > div.os-scrollbar-track": {
      height: `calc(100% - ${spacing(6)})`,
      marginTop: spacing(6),
    },
    "div > div.os-scrollbar-track": {
      "--os-handle-perpendicular-size": "2px",
      "--os-handle-perpendicular-size-hover": "6px",
      "--os-handle-perpendicular-size-active": "6px",
      "> div.os-scrollbar-handle": {
        borderRadius: 0,
        opacity: 0.5,
        "&:hover": { opacity: 0.8 },
      },
    },
  });
  const [initialize] = useOverlayScrollbars({
    options: {
      overflow: { x: "hidden", y: "scroll" },
      scrollbars: {
        autoHide: "move",
        theme: palette.mode === "dark" ? "os-theme-light" : "os-theme-dark",
      },
    },
  });

  useEffect(() => {
    if (typeof ref !== "function" && ref?.current && containerRef?.current) {
      initialize({
        target: containerRef.current,
        elements: {
          viewport: ref.current,
        },
      });
    }
  }, [initialize]);

  const refSetter = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && ref) {
        if (typeof ref === "function") {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    },
    [ref]
  );

  return (
    <div ref={containerRef} style={style} className={cls}>
      <div ref={refSetter} {...rest}>
        {children}
      </div>
    </div>
  );
}
export type LazyListHandle = Handle;

export type LazyListProps<T> = {
  items?: T[];
  renderItem?: (item: T, index: number) => ReactElement;
  listOptions?: Partial<ListProps<T, Record<string, unknown>>> & {
    ref?: Ref<VirtuosoHandle>;
  };
  placeholder?: ReactNode;
} & Omit<BoxProps, "placeholder">;

export function LazyList<T>({
  items = [],
  renderItem,
  listOptions: options,
  ...props
}: LazyListProps<T>) {
  return (
    <Box {...props}>
      <List
        components={{ Scroller }}
        totalCount={items.length}
        itemContent={(i) => renderItem?.(items[i], i)}
        {...options}
      />
    </Box>
  );
}
