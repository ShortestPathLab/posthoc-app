import { Box, BoxProps, useTheme } from "@mui/material";
import {
  ReactElement,
  ReactNode,
  forwardRef,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useCss, useDebounce, useGetSet, useThrottle } from "react-use";
import {
  VirtuosoHandle as Handle,
  Virtuoso as List,
  VirtuosoProps as ListProps,
  ScrollerProps,
} from "react-virtuoso";
import { Scroll } from "./Scrollbars";
import { useDebouncedReducer } from "hooks/useDebouncedReducer";
import { replace } from "slices/reducers";
import { debounce, noop } from "lodash";

const Scroller = forwardRef<HTMLDivElement, ScrollerProps>(
  ({ style, ...props }, ref) => {
    const { spacing } = useTheme();
    const cls = useCss({
      "> .os-scrollbar-vertical > .os-scrollbar-track > .os-scrollbar-handle": {
        "min-height": spacing(12),
      },
    });
    return (
      <Scroll
        y
        className={cls}
        style={{ width: "100%", height: "100%" }}
        {...props}
        ref={ref}
      />
    );
  }
);

export type LazyListHandle = Handle;

export type LazyListProps<T> = {
  items?: T[];
  renderItem?: (item: T, index: number) => ReactElement;
  listOptions?: Partial<ListProps<T>>;
  placeholder?: ReactNode;
} & Omit<BoxProps, "placeholder">;

export function LazyList<T>({
  items = [],
  renderItem,
  listOptions: options,
  placeholder,
  ...props
}: LazyListProps<T>) {
  const [isScrolling, setIsScrolling] = useGetSet(false);

  // const handleScrolling = useMemo(
  //   () => debounce(setIsScrolling, 150, { leading: true, trailing: false }),
  //   [setIsScrolling]
  // );

  return (
    <Box {...props}>
      <List
        components={{ Scroller }}
        totalCount={items.length}
        // isScrolling={handleScrolling}
        itemContent={(i) =>
          isScrolling() && placeholder ? placeholder : renderItem?.(items[i], i)
        }
        {...options}
      />
    </Box>
  );
}
