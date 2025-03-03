import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { AddOutlined as Add } from "@mui-symbols-material/w400";
import { Box, ButtonProps, Collapse, Stack, Typography } from "@mui/material";

import {
  defer,
  filter,
  find,
  findIndex,
  last,
  map,
  noop,
  pick,
  pull,
  set,
  sortBy,
} from "lodash-es";
import { nanoid as id } from "nanoid";

import { EditorProps } from "components/Editor";
import { useInitialRender } from "hooks/useInitialRender";
import { CSSProperties, ForwardedRef, ReactElement, ReactNode } from "react";
import { useMap } from "react-use";
import { Transaction } from "slices/selector";
import { wait } from "utils/timed";
import { Button } from "../inputs/Button";
import { DraggableListItem } from "./ListEditorField";

export type Key = string;

export type Item<T> = {
  enabled?: boolean;
  value?: T;
  id: Key;
};

export type Props<T> = {
  button?: boolean;
  onChange?: (value: Transaction<T[]>) => void;
  onChangeItem?: (key: Key, value: T, enabled: boolean) => void;
  onAddItem?: (partial?: Partial<T>) => void;
  onDeleteItem?: (key: Key) => void;
  category?: (value?: T) => string;
  order?: (value?: T) => string | number;
  extras?: (value?: T) => ReactNode;
  items?: Item<T>[];
  addItemLabel?: ReactNode;
  renderAddItem?: (
    create: (c: Partial<T>) => void,
    button: ReactElement
  ) => ReactNode;
  addItemExtras?: ReactNode;
  sortable?: boolean;
  toggleable?: boolean;
  deletable?: boolean;
  icon?: ReactElement | null;
  orderable?: boolean;
  editable?: boolean;
  addable?: boolean;
  variant?: "outlined" | "default";
  placeholder?: ReactNode;
  cardStyle?: CSSProperties;
  autoFocus?: boolean;
  renderEditor?: (parts: {
    handle: ReactNode;
    props: {
      id: Key;
      autoFocus?: boolean;
      onDelete?: () => void;
      ref?: ForwardedRef<HTMLElement | null>;
    } & EditorProps<T>;
    extras: ReactNode;
  }) => ReactNode;
};

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

function second<U>(_: unknown, b: U) {
  return b;
}

export default function Editor<T extends { key: Key }>(props: Props<T>) {
  const {
    addItemLabel = "Add Item",
    onAddItem = noop,
    onDeleteItem = noop,
    items,
    placeholder,
    autoFocus,
    order,
    onChange,
    addItemExtras: extras,
    addable = true,
    renderAddItem = second,
  } = props;
  const initial = useInitialRender();
  const [deleting, { set: pushDeleting, remove: pullDeleting }] = useMap();

  const handleDelete = async (e: string): Promise<void> => {
    pushDeleting(e, true);
    await wait(600);
    onDeleteItem(e);
    pullDeleting(e);
  };

  const isEmpty = !filter(items, (item) => !deleting[item.id]).length;

  return (
    <DragDropContext
      onDragEnd={(result) => {
        // dropped outside the list
        if (!result.destination) return;
        const { source, destination } = result;

        function f<T>(xs: T[]) {
          return reorder(xs, source.index, destination.index);
        }

        onChange?.(f);
      }}
    >
      <Box>
        <Droppable
          droppableId="list"
          isDropDisabled={false}
          isCombineEnabled={false}
          ignoreContainerClipping={true}
        >
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {map(
                sortBy(items, (c) => order?.(c.value)),
                (item, i, xs) => (
                  <Collapse
                    key={item.id}
                    unmountOnExit
                    appear={!initial}
                    in={!deleting[item.id]}
                    mountOnEnter
                  >
                    <DraggableListItem<T>
                      {...pick(props, [
                        "toggleable",
                        "deletable",
                        "editable",
                        "button",
                        "onChangeItem",
                        "onDeleteItem",
                        "extras",
                        "sortable",
                        "renderEditor",
                        "id",
                        "editor",
                        "enabled",
                        "value",
                      ])}
                      onDeleteItem={handleDelete}
                      item={item}
                      i={i}
                      autoFocus={autoFocus && item.id === last(xs)?.id}
                    />
                  </Collapse>
                )
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <Collapse in={isEmpty}>
          <Box ml={2} my={1}>
            <Typography component="div" color="text.secondary">
              {placeholder ?? "No items"}
            </Typography>
          </Box>
        </Collapse>
        <Stack p={2} pt={2} gap={2} direction="row">
          {addable && (
            <CustomAddItemButton
              label={addItemLabel}
              render={renderAddItem}
              onAdd={(c?: Partial<T>) => {
                onAddItem(c);
              }}
            />
          )}
          {extras}
        </Stack>
      </Box>
    </DragDropContext>
  );
}

export function AddItemButton({ children, ...props }: ButtonProps) {
  return (
    <Button disableElevation variant="outlined" startIcon={<Add />} {...props}>
      {children}
    </Button>
  );
}

function CustomAddItemButton<T>({
  label,
  render,
  onAdd,
}: {
  label: ReactNode;
  render: (onAdd: (c?: Partial<T>) => void, button: ReactElement) => ReactNode;
  onAdd: (c?: Partial<T>) => void;
}) {
  return render(
    onAdd,
    <AddItemButton onClick={() => onAdd()}>{label}</AddItemButton>
  );
}

export function ListEditor<T extends { key: Key }>({
  onChange,
  value,
  create,
  onFocus,
  ...props
}: Omit<Props<T>, "items" | "onChange"> & {
  items?: T[];
  onChange?: (value: Transaction<T[]>) => void;
  value?: T[];
  create?: () => Omit<T, "key">;
  onFocus?: (key: Key) => void;
}) {
  return (
    <Editor
      deletable
      editable={false}
      {...props}
      items={map(value, (c) => ({
        id: c.key,
        value: c,
      }))}
      onAddItem={(t) => {
        const key = id();
        onChange?.((xs) => void xs.push({ ...(create?.() as T), ...t, key }));
        defer(() => onFocus?.(key));
      }}
      onDeleteItem={(k) =>
        onChange?.((xs) => void pull(xs, find(xs, { key: k })))
      }
      onChangeItem={(k, v) =>
        onChange?.(
          (xs) =>
            void set(
              xs,
              findIndex(xs, (x) => x.key === k),
              v
            )
        )
      }
      onChange={(k) => onChange?.(k)}
    />
  );
}
