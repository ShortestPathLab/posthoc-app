import {
  Box,
  Checkbox,
  FormControlLabel,
  Popover,
  Stack,
  rgbToHex,
  useTheme,
} from "@mui/material";
import interpolate from "color-interpolate";
import { EditorProps } from "components/Editor";
import { FeaturePickerButton } from "components/app-bar/FeaturePickerButton";
import { Option } from "components/layer-editor/Option";
import { find, flow, round, set, sortBy, startCase } from "lodash";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";
import memo from "memoizee";
import { getClosestColor } from "nearest-pantone";
import { withProduce } from "produce";
import { HexColorPicker } from "react-colorful";
import { byPoint } from "../../NodeMatcher";
import { MapEditor, MapParser, ParsedMapHydrator } from "../Parser";
import { getGridSymbolsAsync } from "./getGridSymbolsAsync";
import { Options } from "./parseGrid.worker";
import { parseGridAsync } from "./parseGridAsync";
import { useDebouncedState } from "hooks/useDebouncedState";

const { floor } = Math;

function between(v: number, min: number, max: number) {
  return v >= min && v < max;
}

export const parse: MapParser = memo(
  async (m = "", options: Options) => {
    return {
      ...(await parseGridAsync({
        map: m,
        options,
      })),
    };
  },
  { normalizer: JSON.stringify }
);

export function SymbolColorPicker({
  onChange,
  value: _value,
  autoValue,
}: EditorProps<string | undefined> & { autoValue?: string }) {
  const [value, setValue] = useDebouncedState(_value, onChange);

  const displayColor = value ?? autoValue;

  return (
    <PopupState variant="popover">
      {(state) => (
        <>
          <FeaturePickerButton {...bindTrigger(state)}>
            <Stack direction="row" gap={1} alignItems="center">
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: displayColor,
                  outline: (t) => `1px solid ${t.palette.divider}`,
                  borderRadius: 4,
                }}
              />
              {value
                ? startCase(getClosestColor(value)?.name ?? "Custom")
                : "Auto"}
            </Stack>
          </FeaturePickerButton>
          <Popover
            transformOrigin={{ horizontal: "left", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "top" }}
            {...bindPopover(state)}
            slotProps={{
              paper: { sx: { overflow: "visible" } },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={!value}
                    onChange={(_, checked) =>
                      setValue?.(checked ? undefined : autoValue)
                    }
                  />
                }
                label="Choose Automatically"
              />
            </Box>
            <Box
              sx={{
                p: 2,
                pt: 0,
                ...(!value && {
                  opacity: (t) => t.palette.action.disabledOpacity,
                  pointerEvents: "none",
                }),
              }}
            >
              <HexColorPicker color={value ?? autoValue} onChange={setValue} />
            </Box>
          </Popover>
        </>
      )}
    </PopupState>
  );
}

export const editor: MapEditor<{
  symbols?: Record<string, string>;
}> = async (map?: string) => {
  if (map) {
    const { symbols } = await getGridSymbolsAsync({ map });
    return withProduce(({ produce, value }) => {
      const { palette } = useTheme();
      const gradient = flow(
        interpolate([palette.background.paper, palette.text.primary]),
        rgbToHex
      );
      return (
        <>
          {sortBy(symbols, "value").map(({ symbol: key }) => (
            <Option
              key={key}
              label={`Tile color for "${key}"`}
              content={
                <SymbolColorPicker
                  value={value?.symbols?.[key]}
                  autoValue={gradient(
                    find(symbols, { symbol: key })?.value ?? 0
                  )}
                  onChange={(v) =>
                    produce((prev) => {
                      set(prev, `symbols["${key}"]`, v);
                    })
                  }
                />
              }
            />
          ))}
        </>
      );
    });
  } else {
    return () => <></>;
  }
};

export const hydrate: ParsedMapHydrator = (result) => {
  const { width, height } = result.bounds;
  return {
    ...result,
    snap: ({ x: x1, y: y1 }, scale = 1) => {
      const [x, y] = [round(-1 + x1 + scale / 2), round(-1 + y1 + scale / 2)];
      if (between(x, 0, width) && between(y, 0, height)) return { x, y };
    },
    nodeAt: (point) => {
      const { x, y } = point;
      return y * width + x;
    },
    pointOf: (node) => ({ x: node % width, y: ~~(node / width) }),
    matchNode: byPoint,
  };
};
