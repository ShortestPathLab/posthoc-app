import { Box, BoxProps } from "@material-ui/core";
import { CSSProperties, ReactElement } from "react";
import { AutoSizer as AutoSize } from "react-virtualized";
import {
  FixedSizeList as List,
  FixedSizeListProps as ListProps,
} from "react-window";

export type LazyListProps<T> = {
  items?: T[];
  itemHeight?: number;
  renderItem?: (item: T, index: number, style: CSSProperties) => ReactElement;
  listOptions?: Partial<ListProps>;
  listPadding?: number;
} & BoxProps;

export function LazyList<T>({
  items = [],
  listPadding: r = 0,
  itemHeight = 0,
  renderItem,
  listOptions: options,
  ...props
}: LazyListProps<T>) {
  return (
    <Box {...props}>
      <AutoSize>
        {(dimensions) => (
          <List
            {...dimensions}
            itemSize={itemHeight + r}
            itemCount={items.length}
            style={{ paddingBottom: r }}
            {...options}
          >
            {({ index: i, style }) => renderItem?.(items[i], i, style) ?? <></>}
          </List>
        )}
      </AutoSize>
    </Box>
  );
}
