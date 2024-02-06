import { EditOutlined } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Stack,
  TextField,
  Typography as Type,
} from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Flex } from "components/generic/Flex";
import {
  ManagedModal as Dialog,
  AppBarTitle as Title,
} from "components/generic/Modal";
import { Space } from "components/generic/Space";
import { debounce, keys, set, startCase } from "lodash";
import { produce } from "produce";
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
import { layerHandlers } from "layers/layerHandlers";
import { inferLayerName } from "layers/inferLayerName";

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
  ms: number = 600
) {
  const [state, setState] = useState(initial);
  useEffect(() => void setState(initial), [setState, initial]);
  const handleChange = useMemo(
    () => debounce((v: T) => commit?.(v), ms),
    [commit, ms]
  );
  return [
    state,
    (value: T) => {
      setState(value);
      handleChange(value);
    },
  ] as const;
}

function Component(
  { value, onValueChange: onChange }: LayerEditorProps,
  _ref: ForwardedRef<HTMLElement>
) {
  const [draft, setDraft] = useDraft(value, onChange);

  const renderHeading = (label: ReactNode) => (
    <Type
      variant="overline"
      color="text.secondary"
      sx={{ pt: 1 }}
      component="p"
    >
      {label}
    </Type>
  );
  const renderLabel = (label: ReactNode) => (
    <Type variant="body1">{label}</Type>
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

  return (
    <>
      <Stack alignItems="center" direction="row" gap={2}>
        <Box py={1} ml={-1}>
          <Type>{name}</Type>
          <Type variant="body2" color="text.secondary">
            {startCase(draft.source?.type)}
          </Type>
        </Box>
        <Space flex={1} />
        <Stack alignItems="center" direction="row">
          <Dialog
            appBar={{ children: <Title>Edit Layer</Title> }}
            trigger={(onClick) => (
              <IconButton size="small" onClick={onClick}>
                <EditOutlined />
              </IconButton>
            )}
          >
            <Box p={2}>
              <Box pb={2}>
                <TextField
                  fullWidth
                  variant="filled"
                  label="Layer Name"
                  defaultValue={draft.name ?? ""}
                  onChange={(e) =>
                    setDraft?.(
                      produce(draft, (d) => set(d, "name", e.target.value))
                    )
                  }
                />
              </Box>

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
                  showArrow
                  onChange={(e) =>
                    setDraft?.(produce(draft, (d) => set(d, "transparency", e)))
                  }
                />
              )}
              {renderOption(
                "Display Mode",
                <FeaturePicker
                  label="Display Mode"
                  value={draft.displayMode ?? "source-over"}
                  items={options(compositeOperations)}
                  showArrow
                  onChange={(e) =>
                    setDraft?.(produce(draft, (d) => set(d, "displayMode", e)))
                  }
                />
              )}
              {renderHeading("Source Options")}
              {renderOption(
                "Type",
                <FeaturePicker
                  label="Type"
                  value={draft.source?.type}
                  items={keys(layerHandlers).map((s) => ({
                    id: s,
                    name: startCase(s),
                  }))}
                  onChange={(v) =>
                    setDraft?.(
                      produce(draft, (d) => {
                        set(d, "source", { type: v });
                      })
                    )
                  }
                  showArrow
                />
              )}
              {draft.source?.type &&
                createElement(layerHandlers[draft.source.type].editor, {
                  onChange: (e) => setDraft(e(draft)),
                  value: draft,
                })}
            </Box>
          </Dialog>
        </Stack>
      </Stack>
    </>
  );
}

export const LayerEditor = forwardRef(Component);
