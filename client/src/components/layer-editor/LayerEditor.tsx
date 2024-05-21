import {
  Box,
  ButtonBase,
  Chip,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography as Type,
} from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Flex } from "components/generic/Flex";
import { ManagedModal as Dialog } from "components/generic/Modal";
import { Space } from "components/generic/Space";
import { inferLayerName } from "layers/inferLayerName";
import { getLayerHandler, layerHandlers } from "layers/layerHandlers";
import {
  debounce,
  first,
  keys,
  merge,
  omit,
  set,
  startCase,
  truncate,
} from "lodash";
import {
  ForwardedRef,
  ReactNode,
  createElement,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Layer } from "slices/layers";
import { useAcrylic, usePaper } from "theme";

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
  value: Layer;
  onValueChange?: (v: Layer) => void;
};

function useDraft<T>(
  initial: T,
  commit?: (value: T) => void,
  ms: number = 300,
  stayDraft: string[] = []
) {
  const [state, setState] = useState(initial);
  useEffect(() => {
    if (initial) {
      requestIdleCallback(() =>
        setState(merge(state, omit(initial, ...stayDraft)))
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

function Component(
  { value, onValueChange: onChange }: LayerEditorProps,
  _ref: ForwardedRef<HTMLElement>
) {
  const paper = usePaper();
  const acrylic = useAcrylic();
  const [draft, setDraft] = useDraft(value, onChange, 300, [
    "name",
    "source.type",
  ]);

  const renderHeading = (label: ReactNode) => (
    <Type
      component="div"
      variant="overline"
      color="text.secondary"
      sx={{ pt: 1 }}
    >
      {label}
    </Type>
  );
  const renderLabel = (label: ReactNode) => (
    <Type component="div" variant="body1">
      {label}
    </Type>
  );
  const renderOption = (label: ReactNode, option: ReactNode) => (
    <Flex alignItems="center">
      {renderLabel(label)}
      <Space flex={1} />
      {option}
    </Flex>
  );

  const options = (a: string[]) =>
    a.map((c) => ({
      id: c,
      name: startCase(c),
    }));

  const name = draft.name || inferLayerName(value);

  const error = getLayerHandler(value)?.error?.(value);

  return (
    <>
      <Dialog
        popover
        slotProps={{
          popover: {
            anchorOrigin: { horizontal: -12, vertical: -12 },
          },
        }}
        appBar={{ children: "Edit Layer" }}
        trigger={(onClick) => (
          <ButtonBase
            onClick={onClick}
            className={draft.key}
            sx={{
              flex: 1,
              display: "block",
              textAlign: "left",
              px: 2,
            }}
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
                {getLayerHandler(value).icon}
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
                  {startCase(value.source?.type)}
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
          </ButtonBase>
        )}
      >
        <Box p={2}>
          <TextField
            sx={{ mb: 2 }}
            autoComplete="off"
            autoFocus
            placeholder={inferLayerName(draft)}
            fullWidth
            variant="filled"
            label="Layer Name"
            defaultValue={draft.name ?? ""}
            onChange={(e) => setDraft?.((d) => set(d, "name", e.target.value))}
          />
          <Box sx={{ mx: -2, pb: 1 }}>
            <Tabs
              variant="fullWidth"
              onChange={(_, v) =>
                setDraft?.((d) => set(d, "source", { type: v }))
              }
              value={draft.source?.type ?? first(keys(layerHandlers)) ?? ""}
            >
              {keys(layerHandlers).map((s) => (
                <Tab label={startCase(s)} value={s} key={s} />
              ))}
            </Tabs>
            <Divider sx={{ width: "100%" }} />
          </Box>

          {renderHeading("Source Options")}
          {draft.source?.type &&
            createElement(layerHandlers[draft.source.type].editor, {
              onChange: setDraft,
              value: draft,
            })}
          {renderHeading("Layer Options")}
          {renderOption(
            "Transparency",
            <FeaturePicker
              label="Transparency"
              items={["0", "25", "50", "75"].map((c) => ({
                id: c,
                name: `${c}%`,
              }))}
              value={draft.transparency ?? "0"}
              arrow
              onChange={(e) => setDraft?.((d) => set(d, "transparency", e))}
            />
          )}
          {renderOption(
            "Display Mode",
            <FeaturePicker
              arrow
              label="Display Mode"
              value={draft.displayMode ?? "source-over"}
              items={options(compositeOperations)}
              onChange={(e) => setDraft?.((d) => set(d, "displayMode", e))}
            />
          )}
        </Box>
      </Dialog>
    </>
  );
}

export const LayerEditor = forwardRef(Component);
