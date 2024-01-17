import { useTheme } from "@mui/material";
import interpolate from "color-interpolate";
import { useSnackbar } from "components/generic/Snackbar";
import { getParser } from "components/renderer";
import { useAsync } from "react-async-hook";
import { Map } from "slices/UIState";
import { useLoadingState } from "slices/loading";

export function useParsedMap(map?: Map, options?: Record<string, any>) {
  const notify = useSnackbar();
  const theme = useTheme();
  const usingLoadingState = useLoadingState("map");

  const { format, content } = map ?? {};

  return useAsync(
    () =>
      usingLoadingState(async () => {
        if (format && content) {
          const gradient = interpolate([
            theme.palette.background.paper,
            theme.palette.text.primary,
          ]);
          notify("Processing map...");
          const parsedMap = (await getParser(format)?.parse?.(content, {
            color: gradient(0.85),
            ...options,
          })) ?? { nodes: [] };

          notify(
            "Map loaded",
            `${parsedMap.nodes.length} elements, ${parsedMap.log.join(", ")}`
          );
          return parsedMap;
        }
      }),
    [format, content, theme, options]
  );
}
