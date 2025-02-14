import { Draggable, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import {
  CloseOutlined as DeleteIcon,
  DragHandleOutlined,
  EditOutlined as EditIcon,
} from "@mui-symbols-material/w400";
import {
  Box,
  ButtonBase,
  IconButton,
  InputBase,
  Stack,
  Switch,
} from "@mui/material";
import { ReactNode, useState } from "react";
import { useAcrylic, usePaper } from "theme";
import { Block } from "../Block";
import { Item, Key, Props } from "./ListEditor";

import { noop } from "lodash";
import { ComponentProps, forwardRef } from "react";

export const DefaultListEditorInput = forwardRef(function StyledInputBase(
  props: ComponentProps<typeof InputBase>,
  ref
) {
  return (
    <InputBase
      fullWidth
      {...props}
      placeholder="Untitled item"
      inputRef={ref}
    />
  );
});
type ListEditorFieldProps = {
  isPlaceholder?: boolean;
  i?: number;
};
const defaultEditorRenderer: Props<unknown>["renderEditor"] = ({
  handle,
  props,
  extras,
}) => (
  <>
    {handle}
    <DefaultListEditorInput {...props} />
    {extras}
  </>
);
export type ListEditorFieldProps1<T> = Props<T> &
  ListEditorFieldProps & { item: Item<T> };

export function DraggableListItem<T extends { key: Key }>({
  toggleable,
  deletable,
  editable = true,
  onChangeItem = noop,
  onDeleteItem = noop,
  extras: getExtras,
  item,
  i = 0,
  autoFocus,
  sortable,
  button = true,
  renderEditor = defaultEditorRenderer as Props<T>["renderEditor"],
}: ListEditorFieldProps1<T>) {
  return (
    <Draggable index={i} draggableId={`${item?.id}`}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <ListItem<T>
            {...{
              toggleable,
              editable,
              deletable,
              getExtras,
              sortable,
              button,
              isDragging: snapshot.isDragging,
              renderEditor,
              onChangeItem,
              slotProps: { handle: provided.dragHandleProps! },
              onDeleteItem,
              autoFocus,
              item,
            }}
          />
        </div>
      )}
    </Draggable>
  );
}

function ListItem<T extends { key: Key }>({
  toggleable,
  editable,
  deletable,
  getExtras,
  sortable,
  button,
  isDragging,
  renderEditor,
  onChangeItem,
  slotProps,
  onDeleteItem,
  autoFocus,
  item,
}: {
  item: Item<T>;
  toggleable?: boolean;
  editable?: boolean;
  deletable?: boolean;
  getExtras?: (value?: T) => ReactNode;
  sortable?: boolean;
  button?: boolean;
  isDragging?: boolean;
  renderEditor?: Props<T>["renderEditor"];
  onChangeItem: Props<T>["onChangeItem"];
  onDeleteItem: Props<T>["onDeleteItem"];
  autoFocus?: boolean;
  slotProps?: { handle?: DraggableProvidedDragHandleProps };
}) {
  const [field, setField] = useState<HTMLElement | null>(null);
  const acrylic = useAcrylic();
  const paper = usePaper();
  return (
    <Box
      component={button ? ButtonBase : "div"}
      sx={{ width: "100%", textAlign: "left" }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          width: "100%",
          ...(button && {
            transition: (t) => t.transitions.create("background"),
            "&:hover": {
              background: (t) => t.palette.action.hover,
            },
          }),
          ...(isDragging && {
            ...paper(1),
            ...acrylic,
          }),
        }}
      >
        {renderEditor?.({
          handle: sortable && (
            <Stack
              {...slotProps?.handle}
              color="text.secondary"
              sx={{
                flex: 0,
                p: 2,
              }}
            >
              <DragHandleOutlined />
            </Stack>
          ),
          props: {
            onDelete: () => onDeleteItem?.(item.id),
            autoFocus,
            value: item.value,
            id: item.id,
            onChange: (e: T) => onChangeItem?.(item.id, e, !!item.enabled),
            ref: (e: HTMLElement | null) => setField(e),
          },
          extras: (
            <Block sx={{ flex: 0, px: 1 }}>
              {toggleable && (
                <Switch
                  color="primary"
                  edge="end"
                  onChange={(_, v) => onChangeItem?.(item.id, item.value!, v)}
                  checked={item.enabled}
                />
              )}
              {editable && (
                <IconButton
                  edge="end"
                  onClick={() => {
                    if (field?.focus) {
                      field.focus();
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
              )}
              {deletable && (
                <IconButton
                  onClick={() => onDeleteItem?.(item.id)}
                  sx={{ color: (t) => t.palette.text.secondary }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
              {getExtras?.(item.value)}
            </Block>
          ),
        })}
      </Stack>
    </Box>
  );
}
