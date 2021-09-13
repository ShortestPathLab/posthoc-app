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
} from "@material-ui/core";
import {
  Add,
  DeleteOutlined as DeleteIcon,
  EditOutlined as EditIcon,
  LabelOutlined as LabelIcon,
} from "@material-ui/icons";
import { filter, map, sortBy, uniqBy } from "lodash";
import { nanoid as id } from "nanoid";
import {
  cloneElement,
  ComponentProps,
  CSSProperties,
  forwardRef,
  ReactElement,
  ReactNode,
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
}: Props & ListEditorFieldProps & Item) {
  const [field, setField] = useState<HTMLElement | null>(null);
  const theme = useTheme();
  const content = (
    <Box display="flex" alignItems={extrasPlacement}>
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
        style={{
          marginLeft: -theme.spacing(icon === null ? 2 : 0),
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
    <Box
      style={{
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(2),
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
          {content}
        </Card>
      ) : (
        content
      )}
    </Box>
  );
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
  const children = uniqBy([...intermediateItems, ...items], (c) => c.id)
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
                  color="textSecondary"
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
        {(() => {
          const out: ReactNode[] = [];
          sorted.forEach((c, i) => {
            if (getCategory && isNewCategory(sorted, i, c)) {
              out.push(
                <Collapse
                  in={items.some(
                    (c2) => getCategory(c2.value) === getCategory(c.value)
                  )}
                  appear
                  key={getCategory(c.value)}
                >
                  <Box pl={2} pb={2} pt={1}>
                    <Typography variant="overline" color="textSecondary">
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
      </Box>
      <Collapse in={!items?.length}>
        <Box ml={2} mb={1} pt={getCategory ? 1 : 0}>
          <Typography color="textSecondary">
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
      </Box>
    </List>
  );

  function isNewCategory(
    arr: {
      value: T | undefined;
      render: (
        p?: (Props<any> & ListEditorFieldProps & Item<any>) | undefined
      ) => JSX.Element;
      key: Key;
    }[],
    i: number,
    c: {
      value: T | undefined;
      render: (
        p?: (Props<any> & ListEditorFieldProps & Item<any>) | undefined
      ) => JSX.Element;
      key: Key;
    }
  ) {
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
  ...props
}: Omit<Props<T>, "items"> & {
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
          handleChange([...state, { key: id(), ...create?.() } as T])
        }
        onDeleteItem={(k) => {
          return handleChange(filter(state, (b) => b.key !== k));
        }}
        onChangeItem={(k, v) =>
          handleChange(map(state, (b) => (b.key === k ? v : b)))
        }
      />
    </Box>
  );
}
