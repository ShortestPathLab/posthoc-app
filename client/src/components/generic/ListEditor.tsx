import {
  Add,
  ClearOutlined as DeleteIcon,
  DragHandleOutlined,
  EditOutlined as EditIcon,
  LabelOutlined as LabelIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonBase,
  Collapse,
  IconButton,
  InputBase,
  List,
  ListSubheader,
  Stack,
  Switch,
  SxProps,
  Theme,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { defer, filter, map, sortBy, uniqBy } from "lodash";
import { nanoid as id } from "nanoid";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import {
  CSSProperties,
  ComponentProps,
  ReactElement,
  ReactNode,
  cloneElement,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAcrylic, usePaper } from "theme";
import { Flex } from "./Flex";

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

type Key = string | number;

type Item<T = any> = {
  editor?: ReactElement;
  enabled?: boolean;
  value?: T;
  id: Key;
};

type Props<T = any> = {
  button?: boolean;
  UNSAFE_label?: ReactNode;
  UNSAFE_text?: ReactNode;
  UNSAFE_extrasPlacement?: "flex-start" | "center" | "flex-end";
  onChange?: (value: Item<T>[]) => void;
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
  variant?: "outlined" | "default";
  placeholder?: ReactNode;
  cardStyle?: CSSProperties;
  autoFocus?: boolean;
  renderEditor?: (parts: {
    value: T;
    onValueChange: (v: T) => void;
    handle: ReactNode;
    content: ReactNode;
    extras: ReactNode;
  }) => ReactNode;
};

type ListEditorFieldProps = {
  isPlaceholder?: boolean;
  i?: number;
};

function useInitialRender() {
  const ref = useRef(false);
  const current = ref.current;
  ref.current = true;
  return !current;
}

const defaultEditorRenderer: Props["renderEditor"] = ({
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

export function ListEditorField({
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
  renderEditor = defaultEditorRenderer,
}: Props & ListEditorFieldProps & Item) {
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
              onValueChange: (e: any) => onChangeItem(id ?? i, e, enabled),
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
                    onValueChange: (e: any) =>
                      onChangeItem(id ?? i, e, enabled),
                    onChange: (e: any) =>
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
                      onChange={(_, v) => onChangeItem(id ?? i, value, v)}
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
                    <IconButton onClick={() => onDeleteItem(id ?? i)}>
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

// a little function to help us with reordering the result
function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export default function Editor<T>(props: Props<T>) {
  const {
    addItemLabel = "Add Item",
    UNSAFE_label: label,
    UNSAFE_text: text,
    onAddItem = () => {},
    onDeleteItem = () => {},
    items = [],
    placeholder: placeholderText,
    autoFocus,
    category: getCategory,
    order: getOrder,
    onChange,
    addItemExtras: extras,
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
  const children: {
    key: Key;
    in: boolean;
    value?: T;
    render: (p?: ComponentProps<typeof ListEditorField>) => ReactNode;
  }[] = uniqBy([...intermediateItems, ...items], (c) => c.id)
    .map((c) => items.find((c2) => c.id === c2.id) ?? c)
    .map((x, i) => {
      const { enabled, editor, value, id } = x ?? {};
      return {
        value,
        render: (p?: ComponentProps<typeof ListEditorField>) => (
          <Collapse
            in={!!items.find((p) => p.id === x.id)}
            unmountOnExit
            appear={!isInitialRender}
            mountOnEnter
          >
            <ListEditorField
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
    render: (p?: ComponentProps<typeof ListEditorField>) => (
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

        const reordered = reorder(
          items,
          result.source.index,
          result.destination.index
        );

        onChange?.(reordered);
        setIntermediateItems(reordered);
      }}
    >
      <List
        subheader={
          label || text ? (
            <>
              <ListSubheader disableSticky>
                {label && (
                  <Typography variant="body1" gutterBottom color="textPrimary">
                    {label}
                  </Typography>
                )}
                {text && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    style={{ marginBottom: theme.spacing(3) }}
                  >
                    {text}
                  </Typography>
                )}
              </ListSubheader>
            </>
          ) : undefined
        }
      >
        <Box mt={getCategory ? -1 : 0}>
          <Droppable droppableId="list">
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
        <Box p={2} pt={2}>
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
            <Box sx={{ color: "text.primary" }}>{addItemLabel}</Box>
          </Button>
          {extras}
        </Box>
      </List>
    </DragDropContext>
  );

  function isNewCategory(arr: any, i: any, c: any) {
    return !!(
      getCategory &&
      (arr[i - 1] === undefined ||
        getCategory(arr[i - 1].value) !== getCategory(c.value))
    );
  }
}

export function ListEditor<T extends { key: string }>({
  onChange,
  value,
  editor,
  create,
  onFocus,
  ...props
}: Omit<Props<T>, "items" | "onChange"> & {
  items?: T[];
  onChange?: (value: T[]) => void;
  value?: T[];
  editor?: (item: T) => ReactElement;
  create?: () => Omit<T, "key">;
  onFocus?: (key: string) => void;
}) {
  const [state, setState] = useState(value ?? []);
  function handleChange(next: T[]) {
    setState(next);
    onChange?.(next);
  }
  useEffect(() => {
    setState(value ?? []);
  }, [value]);
  return (
    <Box>
      <Editor
        {...props}
        items={state.map((c) => ({
          id: c.key,
          value: c,
          editor: editor?.(c),
        }))}
        deletable
        editable={false}
        onAddItem={() => {
          const _id = id();
          handleChange?.([...state, { key: _id, ...create?.() } as T]);
          defer(() => onFocus?.(_id));
        }}
        onDeleteItem={(k) => {
          return handleChange?.(filter(state, (b) => b.key !== k));
        }}
        onChangeItem={(k, v) =>
          handleChange?.(map(state, (b) => (b.key === k ? v : b)))
        }
        onChange={(k) => handleChange?.(map(k, (a) => a.value!))}
      />
    </Box>
  );
}
