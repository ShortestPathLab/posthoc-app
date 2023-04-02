import { Box, BoxProps } from "@material-ui/core";
import { ReactElement } from "react";
import {
  Virtuoso as List,
  VirtuosoHandle as Handle,
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
  return (
    <Box {...props}>
      <List
        totalCount={items.length}
        itemContent={(i) => renderItem?.(items[i], i)}
        {...options}
      />
    </Box>
  );
}
