import { Draggable } from "@hello-pangea/dnd";
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
  SxProps,
  Theme,
} from "@mui/material";
import { cloneElement, useState } from "react";
import { useAcrylic, usePaper } from "theme";
import { Flex } from "./Flex";
import { Item, Props } from "./ListEditor";

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
  content,
  extras,
}) => (
  <>
    {handle}
    {content}
    {extras}
  </>
);
export type ListEditorFieldProps1<T> = Props<T> &
  ListEditorFieldProps &
  Item<T>;

export function ListEditorField<T>({
  toggleable,
  deletable,
  editable = true,
  onChangeItem = () => {},
  onDeleteItem = () => {},
  extras: getExtras,
  enabled = false,
  editor = <DefaultListEditorInput />,
  value,
  id,
  i = 0,
  autoFocus,
  sortable,
  button = true,
  renderEditor = defaultEditorRenderer as Props<T>["renderEditor"],
}: ListEditorFieldProps1<T>) {
  const acrylic = useAcrylic();
  const paper = usePaper();
  const [field, setField] = useState<HTMLElement | null>(null);
  const ListElement = (button ? ButtonBase : Box) as typeof Box;
  return (
    <Draggable index={i} draggableId={`${id}`}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              ...(button
                ? {
                    transition: (t) => t.transitions.create("background"),
                    "&:hover": {
                      background: (t) => t.palette.action.hover,
                    },
                  }
                : undefined),
              ...(snapshot.isDragging
                ? ({
                    ...paper(1),
                    ...acrylic,
                  } as SxProps<Theme>)
                : undefined),
            }}
          >
            {renderEditor?.({
              value,
              onValueChange: (e: T) => onChangeItem(id ?? i, e, enabled),
              handle: sortable && (
                <Flex
                  {...provided.dragHandleProps}
                  color="text.secondary"
                  sx={{
                    flex: 0,
                    p: 2,
                  }}
                >
                  <DragHandleOutlined />
                </Flex>
              ),
              content: (
                <ListElement
                  sx={{
                    flex: 1,
                    display: "block",
                    textAlign: "left",
                    px: 2,
                  }}
                >
                  {cloneElement(editor, {
                    onDelete: () => onDeleteItem(id ?? i),
                    autoFocus,
                    value,
                    key: id ?? i,
                    onValueChange: (e: T) => onChangeItem(id ?? i, e, enabled),
                    onChange: (e: { target: { value: T } }) =>
                      onChangeItem(id ?? i, e.target.value, enabled),
                    ref: (e: HTMLElement | null) => setField(e),
                  })}
                </ListElement>
              ),
              extras: (
                <Flex sx={{ flex: 0, px: 1 }}>
                  {toggleable && (
                    <Switch
                      color="primary"
                      edge="end"
                      onChange={(_, v) => onChangeItem(id ?? i, value!, v)}
                      checked={enabled}
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
                      onClick={() => onDeleteItem(id ?? i)}
                      sx={{ color: (t) => t.palette.text.secondary }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  {getExtras && getExtras(value)}
                </Flex>
              ),
            })}
          </Stack>
        </div>
      )}
    </Draggable>
  );
}
