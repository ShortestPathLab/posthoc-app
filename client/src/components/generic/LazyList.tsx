import { Box, BoxProps } from "@mui/material";
import { OverlayScrollbars } from "overlayscrollbars";
import { ReactElement, useEffect, useState } from "react";
import {
  VirtuosoHandle as Handle,
  Virtuoso as List,
  VirtuosoProps as ListProps,
} from "react-virtuoso";

export type LazyListHandle = Handle;

export type LazyListProps<T> = {
  items?: T[];
  renderItem?: (item: T, index: number) => ReactElement;
  listOptions?: Partial<ListProps<T>>;
} & BoxProps;

export function LazyList<T>({
  items = [],
  renderItem,
  listOptions: options,
  ...props
}: LazyListProps<T>) {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (ref) {
      console.log(ref);
      ///@ts-ignore
      window.Ov = OverlayScrollbars;
      OverlayScrollbars({ target: ref });
    }
  }, [ref]);
  return (
    <Box {...props}>
      <List
        totalCount={items.length}
        itemContent={(i) => renderItem?.(items[i], i)}
        scrollerRef={(r) => setRef(r as HTMLElement)}
        {...options}
      />
    </Box>
  );
}
