import { filter, map, sortBy, uniqBy } from "lodash";
import { nanoid as id } from "nanoid";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import {
  Add,
  DeleteOutlined as DeleteIcon,
  DragHandleOutlined,
  EditOutlined as EditIcon,
  LabelOutlined as LabelIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Collapse,
  IconButton,
  InputBase,
  List,
  ListSubheader,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";


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
  element?: ReactElement;
  enabled?: boolean;
  value?: T;
  id: Key;
};

type Props<T = any> = {
  onChange?: (value: Item<T>[]) => void;
  sortable?: boolean;
  extras?: ReactNode;
  addItemLabel?: ReactNode;
  label?: ReactNode;
  text?: ReactNode;
  items?: Item<T>[];
  useSwitch?: boolean;
  useDelete?: boolean;
  onChangeItem?: (key: Key, value: T, enabled: boolean) => void;
  onAddItem?: () => void;
  onDeleteItem?: (key: Key) => void;
  icon?: ReactElement | null;
  useReorder?: boolean;
  useEdit?: boolean;
  variant?: "outlined" | "default";
  extrasPlacement?: "flex-start" | "center" | "flex-end";
  placeholderText?: ReactNode;
  cardStyle?: CSSProperties;
  autoFocus?: boolean;
  getCategory?: (value?: T) => string;
  getOrder?: (value?: T) => string | number;
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

export function ListEditorField({
  icon = <LabelIcon />,
  useSwitch,
  useDelete,
  useEdit: useEditButton = true,
  onChangeItem = () => {},
  onDeleteItem = () => {},
  enabled = false,
  element = <DefaultListEditorInput />,
  value,
  id,
  i = 0,
  variant = "default",
  extrasPlacement = "center",
  autoFocus,
  cardStyle: style,
  sortable,
}: Props & ListEditorFieldProps & Item) {
  const [field, setField] = useState<HTMLElement | null>(null);
  const theme = useTheme();
  const content = (handleProps?: ComponentProps<"div"> | null) => (
    <Box display="flex" alignItems={extrasPlacement}>
      {sortable && (
        <div {...handleProps}>
          <Box color="text.secondary" sx={{ pr: 2 }}>
            <DragHandleOutlined />
          </Box>
        </div>
      )}
      {icon !== null &&
        cloneElement(icon, {
          style: {
            marginRight: theme.spacing(1),
            marginTop: theme.spacing(0.5),
            marginBottom: theme.spacing(0.5),
          },
          color: "action",
        })}
      <Box
        flexGrow={1}
        sx={{
          ml: icon === null ? 2 : 0,
        }}
      >
        {cloneElement(element, {
          onDelete: () => onDeleteItem(id ?? i),
          autoFocus,
          value,
          key: id ?? i,
          onValueChange: (e: any) => onChangeItem(id ?? i, e, enabled),
          onChange: (e: any) => onChangeItem(id ?? i, e.target.value, enabled),
          ref: (e: HTMLElement | null) => setField(e),
        })}
      </Box>
      <Box display="flex" alignItems="center">
        {useSwitch && (
          <Switch
            color="primary"
            edge="end"
            onChange={(_, v) => onChangeItem(id ?? i, value, v)}
            checked={enabled}
          />
        )}
        {useEditButton && (
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
        {useDelete && (
          <IconButton onClick={() => onDeleteItem(id ?? i)}>
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
  return (
    <Draggable index={i} draggableId={`${id}`}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <Box
            sx={{
              pb: 1,
              ml: 2,
            }}
          >
            {variant === "outlined" ? (
              <Card
                variant="outlined"
                style={{
                  borderColor: "transparent",
                  paddingRight: theme.spacing(2),
                  transition: theme.transitions.create([
                    "box-shadow",
                    "border-color",
                  ]),
                  ...style,
                }}
              >
                {content(provided.dragHandleProps)}
              </Card>
            ) : (
              content(provided.dragHandleProps)
            )}
          </Box>
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
    label,
    text,
    onAddItem = () => {},
    onDeleteItem = () => {},
    items = [],
    placeholderText,
    autoFocus,
    getCategory,
    getOrder,
    onChange,
    extras,
    sortable,
  } = props;
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
      const { enabled, element, value, id } = x ?? {};
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
              element={element}
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
            {(provided, snapshot) => (
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
        <Box p={2} mb={-3}>
          <Button
            disableElevation
            variant="contained"
            startIcon={<Add />}
            color="primary"
            onClick={() => {
              onAddItem();
              setNewIndex(items.length);
            }}
          >
            {addItemLabel}
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
  value = [],
  editor,
  create,
  ...props
}: Omit<Props<T>, "items" | "onChange"> & {
  items?: T[];
  onChange?: (value: T[]) => void;
  value?: T[];
  editor?: (item: T) => ReactElement;
  create?: () => Omit<T, "key">;
}) {
  const [state, setState] = useState(value ?? []);
  function handleChange(next: T[]) {
    setState(next);
    onChange?.(next);
  }
  useEffect(() => {
    setState(value);
  }, [value]);
  return (
    <Box sx={{ ml: -2 }}>
      <Editor
        {...props}
        items={state.map((c) => ({
          id: c.key,
          value: c,
          element: editor?.(c),
        }))}
        useDelete
        useEdit={false}
        onAddItem={() =>
          handleChange?.([...state, { key: id(), ...create?.() } as T])
        }
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