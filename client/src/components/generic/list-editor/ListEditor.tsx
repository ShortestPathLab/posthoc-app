import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { AddOutlined as Add } from "@mui-symbols-material/w400";
import {
  Box,
  Button,
  Collapse,
  List,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { defer, find, findIndex, pull, set, sortBy, uniqBy } from "lodash";
import { nanoid as id } from "nanoid";

import { useInitialRender } from "hooks/useInitialRender";
import { produce } from "produce";
import {
  CSSProperties,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { Transaction } from "slices/selector";
import { usePaper } from "theme";
import { ListEditorField, ListEditorFieldProps1 } from "./ListEditorField";

type Key = string;

export type Item<T> = {
  editor?: ReactElement;
  enabled?: boolean;
  value?: T;
  id: Key;
};

export type Props<T> = {
  button?: boolean;
  onChange?: (value: Transaction<T[]>) => void;
  onChangeItem?: (key: Key, value: T, enabled: boolean) => void;
  onAddItem?: () => void;
  onDeleteItem?: (key: Key) => void;
  category?: (value?: T) => string;
  order?: (value?: T) => string | number;
  extras?: (value?: T) => ReactNode;
  items?: Item<T>[];
  addItemLabel?: ReactNode;
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
    value?: T;
    onValueChange?: (v: T) => void;
    handle: ReactNode;
    content: ReactNode;
    extras: ReactNode;
  }) => ReactNode;
};

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export default function Editor<T>(props: Props<T>) {
  const {
    addItemLabel = "Add Item",
    onAddItem = () => {},
    onDeleteItem = () => {},
    items = [],
    placeholder: placeholderText,
    autoFocus,
    category: getCategory,
    order: getOrder,
    onChange,
    addItemExtras: extras,
    addable = true,
  } = props;
  const paper = usePaper();
  const isInitialRender = useInitialRender();
  const theme = useTheme();
  const [intermediateItems, setIntermediateItems] = useState(items);
  const [newIndex, setNewIndex] = useState(-1);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIntermediateItems(items);
    }, theme.transitions.duration.standard);
    return () => {
      clearTimeout(timeout);
    };
  }, [items, setIntermediateItems, theme.transitions.duration.standard]);
  const children = uniqBy([...intermediateItems, ...items], (c) => c.id)
    .map((c) => items.find((c2) => c.id === c2.id) ?? c)
    .map((x, i) => {
      const { enabled, editor, value, id } = x ?? {};
      return {
        value,
        render: (p?: ListEditorFieldProps1<T>) => (
          <Collapse
            in={!!items.find((p) => p.id === x.id)}
            unmountOnExit
            appear={!isInitialRender}
            mountOnEnter
          >
            <ListEditorField<T>
              {...props}
              onDeleteItem={(e) => {
                onDeleteItem(e);
                setNewIndex(-1);
              }}
              enabled={enabled}
              editor={editor}
              value={value}
              id={id}
              i={i}
              autoFocus={autoFocus || i === newIndex}
              {...p}
            />
          </Collapse>
        ),
        key: id,
        in: !!items.find((p) => p.id === x.id),
      };
    });
  const sorted = sortBy(
    children,
    (c) => getCategory?.(c.value),
    (c) => getOrder?.(c.value)
  ).map((c) => ({
    ...c,
    render: (p?: ListEditorFieldProps1<T>) => (
      <Box key={c.key}>{c.render(p)}</Box>
    ),
  }));
  return (
    <DragDropContext
      onDragEnd={(result) => {
        // dropped outside the list
        if (!result.destination) {
          return;
        }
        const { source, destination } = result;

        function t<T>(xs: T[]) {
          return reorder(xs, source.index, destination.index);
        }

        onChange?.(t);
        setIntermediateItems(t(items));
      }}
    >
      <List>
        <Box mt={getCategory ? -1 : 0}>
          <Droppable
            droppableId="list"
            isDropDisabled={false}
            isCombineEnabled={false}
            ignoreContainerClipping={true}
          >
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {(() => {
                  const out: ReactNode[] = [];
                  sorted.forEach((c, i) => {
                    if (getCategory && isNewCategory(sorted, i, c)) {
                      out.push(
                        <Collapse
                          in={items.some(
                            (c2) =>
                              getCategory(c2.value) === getCategory(c.value)
                          )}
                          appear
                          key={getCategory(c.value)}
                        >
                          <Box pl={2} pb={2} pt={1}>
                            <Typography
                              component="div"
                              variant="overline"
                              color="text.secondary"
                            >
                              {getCategory(c.value)}
                            </Typography>
                          </Box>
                        </Collapse>
                      );
                    }
                    out.push(c.render());
                  });
                  return out;
                })()}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </Box>
        <Collapse in={!items?.length}>
          <Box ml={2} mb={1} pt={getCategory ? 1 : 0}>
            <Typography component="div" color="text.secondary">
              {placeholderText ?? "No items"}
            </Typography>
          </Box>
        </Collapse>
        <Stack p={2} pt={2} gap={2} direction="row">
          {addable && (
            <Button
              disableElevation
              variant="outlined"
              startIcon={<Add />}
              onClick={() => {
                onAddItem();
                setNewIndex(items.length);
              }}
              sx={{
                ...paper(1),
              }}
            >
              <Box
                sx={{
                  color: "text.primary",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {addItemLabel}
              </Box>
            </Button>
          )}
          {extras}
        </Stack>
      </List>
    </DragDropContext>
  );

  function isNewCategory(arr: { value?: T }[], i: number, c: { value?: T }) {
    return !!(
      getCategory &&
      (arr[i - 1] === undefined ||
        getCategory(arr[i - 1].value) !== getCategory(c.value))
    );
  }
}

export function ListEditor<T extends { key: Key }>({
  onChange,
  value,
  editor,
  create,
  onFocus,
  ...props
}: Omit<Props<T>, "items" | "onChange"> & {
  items?: T[];
  onChange?: (value: Transaction<T[]>) => void;
  value?: T[];
  editor?: (item: T) => ReactElement;
  create?: () => Omit<T, "key">;
  onFocus?: (key: Key) => void;
}) {
  const [state, setState] = useState(value ?? []);
  function handleChange(next: Transaction<T[]>) {
    setState(produce(state, next));
    onChange?.(next);
  }

  useEffect(() => {
    setState(value ?? []);
  }, [value]);

  return (
    <Box>
      <Editor
        deletable
        editable={false}
        {...props}
        items={state.map((c) => ({
          id: c.key,
          value: c,
          editor: editor?.(c),
        }))}
        onAddItem={() => {
          const key = id();
          handleChange?.((xs) => void xs.push({ ...(create?.() as T), key }));
          defer(() => onFocus?.(key));
        }}
        onDeleteItem={(k) =>
          handleChange?.((xs) => void pull(xs, find(xs, { key: k })))
        }
        onChangeItem={(k, v) =>
          handleChange?.(
            (xs) =>
              void set(
                xs,
                findIndex(xs, (x) => x.key === k),
                v
              )
          )
        }
        onChange={(k) => handleChange?.(k)}
      />
    </Box>
  );
}
