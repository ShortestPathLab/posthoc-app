import {
  Box,
  Chip,
  Divider,
  Stack,
  StackProps,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography as Type,
} from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Block } from "components/generic/Block";
import { Space } from "components/generic/Space";
import { Surface } from "components/generic/surface";
import { inferLayerName } from "layers/inferLayerName";
import { getController, getControllers } from "layers/layerControllers";
import {
  debounce,
  head,
  isEqual,
  keys,
  merge,
  omit,
  pick,
  startCase,
  truncate,
} from "lodash";
import { ReactNode, createElement, useEffect, useMemo, useState } from "react";
import { slice } from "slices";
import { Layer, WithLayer } from "slices/layers";
import { Transaction } from "slices/selector";
import { usePaper } from "theme";
import { set } from "utils/set";
import { useOptimisticTransaction } from "../../hooks/useOptimistic";
import { idle } from "../../utils/idle";

const compositeOperations = [
  "color",
  "color-burn",
  "color-dodge",
  "copy",
  "darken",
  "destination-atop",
  "destination-in",
  "destination-out",
  "destination-over",
  "difference",
  "exclusion",
  "hard-light",
  "hue",
  "lighten",
  "lighter",
  "luminosity",
  "multiply",
  "overlay",
  "saturation",
  "screen",
  "soft-light",
  "source-atop",
  "source-in",
  "source-out",
  "source-over",
  "xor",
];

type LayerEditorProps = {
  layer?: string;
  onValueChange?: (v: Transaction<Layer>) => void;
};

export function useDraft<T>(
  initial: T,
  commit?: (value: T) => void,
  ms: number = 300,
  stayDraft: string[] = []
) {
  const [state, setState] = useState(initial);
  useEffect(() => {
    if (initial) {
      requestIdleCallback(() =>
        setState(merge({}, state, omit(initial, ...stayDraft)))
      );
    }
  }, [setState, initial]);
  const handleChange = useMemo(
    () => debounce((v: T) => commit?.(v), ms),
    [commit, ms]
  );
  return [
    state,
    (value: (prev: T) => T) => {
      const next = value(state);
      setState(next);
      handleChange(next);
    },
  ] as const;
}

function useLayerProperties(layer?: string) {
  "use no memo";

  const one = slice.layers.one(layer);

  return one.use(
    (l) => pick(l, "name", "transparency", "displayMode", "source.type"),
    isEqual
  ) as Layer | undefined;
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <Type
      component="div"
      variant="overline"
      color="text.secondary"
      sx={{ pt: 1 }}
    >
      {children}
    </Type>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <Type component="div" variant="body1">
      {children}
    </Type>
  );
}

export function Option({
  label,
  option,
}: {
  label: ReactNode;
  option: ReactNode;
}) {
  return (
    <Block alignItems="center">
      <Label>{label}</Label>
      <Space flex={1} />
      {option}
    </Block>
  );
}

const options = (a: string[]) =>
  a.map((c) => ({
    id: c,
    name: startCase(c),
  }));

export function LayerEditor({ layer: key }: LayerEditorProps) {
  const one = slice.layers.one(key);
  const layer = useLayerProperties(key);
  const [
    { name, transparency, displayMode, source: { type } = {} } = {},
    setOptimistic,
  ] = useOptimisticTransaction(layer!, (f) => idle(() => one.set(f), 1000));

  return (
    <Surface
      popover
      slotProps={{
        popover: {
          anchorOrigin: { horizontal: -12, vertical: -12 },
        },
      }}
      trigger={({ open }) => <Item onClick={open} layer={key} />}
    >
      <Box p={2}>
        <WithLayer layer={key}>
          {(l) => (
            <TextField
              sx={{ mb: 2 }}
              autoComplete="off"
              autoFocus
              placeholder={getController(l)?.inferName?.(l)}
              fullWidth
              variant="filled"
              label="Layer Name"
              defaultValue={name ?? ""}
              onChange={(e) =>
                setOptimistic((d) => set(d, "name", e.target.value))
              }
            />
          )}
        </WithLayer>
        <Box sx={{ mx: -2, pb: 1 }}>
          <Tabs
            variant="fullWidth"
            onChange={(_, v) =>
              setOptimistic((d) => set(d, "source", { type: v }))
            }
            value={type ?? head(keys(getControllers())) ?? ""}
          >
            {keys(getControllers()).map((s) => (
              <Tab label={startCase(s)} value={s} key={s} />
            ))}
          </Tabs>
          <Divider sx={{ width: "100%" }} />
        </Box>

        <Heading>Source Options</Heading>

        {type && getController(type) && (
          <WithLayer layer={key}>
            {(l) =>
              createElement(getController(type).editor, {
                onChange: setOptimistic,
                value: l,
              })
            }
          </WithLayer>
        )}
        <Heading>Layer Options</Heading>
        <Option
          label="Transparency"
          option={
            <FeaturePicker
              label="Transparency"
              items={["0", "25", "50", "75"].map((c) => ({
                id: c,
                name: `${c}%`,
              }))}
              value={transparency ?? "0"}
              arrow
              onChange={(e) =>
                setOptimistic((d) => set(d, "transparency", e as any))
              }
            />
          }
        />
        <Option
          label="Display Mode"
          option={
            <FeaturePicker
              arrow
              label="Display Mode"
              value={displayMode ?? "source-over"}
              items={options(compositeOperations)}
              onChange={(e) =>
                setOptimistic((d) =>
                  set(d, "displayMode", e as GlobalCompositeOperation)
                )
              }
            />
          }
        />
      </Box>
    </Surface>
  );
}

function Item({ layer, ...props }: { layer?: string } & StackProps) {
  const paper = usePaper();
  const one = slice.layers.one<Layer>(layer);

  const { icon } = one.use((l) => getController(l)) ?? {};
  const name = one.use((l) => inferLayerName(l));
  const error = one.use((l) => getController(l)?.error?.(l));
  const type = one.use((l) => l?.source?.type);

  return (
    <Stack
      direction="row"
      className={layer}
      sx={{
        flex: 1,
        display: "block",
        textAlign: "left",
        px: 2,
      }}
      {...props}
    >
      <Stack alignItems="center" direction="row" gap={2}>
        <Stack
          sx={{
            ...paper(0.5),
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            color: "action.disabled",
          }}
        >
          {icon}
        </Stack>
        <Box
          sx={{
            py: 1.5,
            flex: 1,
            width: 0,
            ml: 0,
            overflow: "hidden",
            "> *": {
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            },
          }}
        >
          <Type component="div">{name}</Type>
          <Type component="div" variant="body2" color="text.secondary">
            {startCase(type)}
          </Type>
        </Box>
        {!!error && (
          <Tooltip title={error}>
            <Chip
              sx={{
                mr: -2,
                ...omit(paper(1), "borderRadius"),
                color: (t) => t.palette.error.main,
                flex: 0,
              }}
              label={`${truncate(`${error}`, { length: 8 })}`}
              size="small"
            />
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}
