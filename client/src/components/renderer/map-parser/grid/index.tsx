import { Typography as Type, useTheme } from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Option } from "components/layer-editor/Option";
import { entries, set, startCase } from "lodash";
import memo from "memoizee";
import { withProduce } from "produce";
import { byPoint } from "../../NodeMatcher";
import { MapEditor, MapParser, ParsedMapHydrator } from "../Parser";
import { getGridSymbolsAsync } from "./getGridSymbolsAsync";
import { Options } from "./parseGrid.worker";
import { parseGridAsync } from "./parseGridAsync";
import interpolate from "color-interpolate";

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

export const editor: MapEditor<{
  symbols?: Record<string, string>;
}> = async (map?: string) => {
  if (map) {
    const { symbols } = await getGridSymbolsAsync({ map });
    return withProduce(({ produce, value }) => {
      const { palette } = useTheme();
      const gradient = interpolate([
        palette.background.paper,
        palette.text.primary,
      ]);
      const colors = {
        auto: "auto",
        foreground: gradient(0.85),
        gray: gradient(0.425),
        transparent: "",
      };

      return (
        <>
          {symbols.map((key) => (
            <Option
              key={key}
              label={`Tile color for "${key}"`}
              content={
                <FeaturePicker
                  showArrow
                  label="Color"
                  value={value?.symbols?.[key] ?? "auto"}
                  onChange={(v) =>
                    produce((prev) => {
                      set(prev, `symbols["${key}"]`, v);
                    })
                  }
                  items={entries(colors).map(([k, v]) => ({
                    name: startCase(k),
                    id: v,
                    value: v,
                  }))}
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
      const [x, y] = [floor(x1 + scale / 2), floor(y1 + scale / 2)];
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
