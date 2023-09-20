import { darken, lighten, useTheme } from "@mui/material";
import { Label } from "components/generic/Label";
import { useSnackbar } from "components/generic/Snackbar";
import { getParser } from "components/renderer";
import { useAsync } from "react-async-hook";
import { Map } from "slices/UIState";
import { useLoadingState } from "slices/loading";
import { useSpecimen } from "slices/specimen";

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
