import { darken, lighten, useTheme } from "@mui/material";
import { useAsync } from "react-async-hook";
import { useSnackbar } from "components/generic/Snackbar";
import { getParser } from "components/renderer";
import { useLoadingState } from "slices/loading";
import { Map } from "slices/UIState";

export function useParsedMap(map?: Map) {
  const notify = useSnackbar();
  const theme = useTheme();
  const usingLoadingState = useLoadingState("map");

  const { format, content } = map ?? {};

  return useAsync(
    () =>
      usingLoadingState(async () => {
        const fn = theme.palette.mode === "dark" ? lighten : darken;
        if (format && content) {
          notify("Processing map...");
          const parsedMap = (await getParser(format)?.parse?.(content, {
            color: fn(
              theme.palette.background.paper,
              1 - theme.palette.action.hoverOpacity
            ),
          })) ?? { nodes: [] };

          notify(
            "Map loaded",
            `${parsedMap.nodes.length} elements, ${parsedMap.log.join(", ")}`
          );
          return parsedMap;
        }
      }),
    [format, content, theme]
  );
}