import { darken, lighten, useTheme } from "@mui/material";
import { Label } from "components/generic/Label";
import { useSnackbar } from "components/generic/Snackbar";
import { getParser } from "components/renderer";
import { useAsync } from "react-async-hook";
import { useLoadingState } from "slices/loading";
import { useSpecimen } from "slices/specimen";

export function useParsedMap() {
  const notify = useSnackbar();
  const theme = useTheme();
  const usingLoadingState = useLoadingState("parsedMap");
  const [{ format, map }] = useSpecimen();

  return useAsync(
    () =>
      usingLoadingState(async () => {
        const fn = theme.palette.mode === "dark" ? lighten : darken;
        if (format && map) {
          notify("Processing map...");
          const parsedMap = (await getParser(format)?.(map, {
            color: fn(
              theme.palette.background.paper,
              1 - theme.palette.action.hoverOpacity
            ),
          })) ?? { nodes: [] };

          notify(
            <Label
              primary="Map loaded."
              secondary={`${
                parsedMap.nodes.length
              } elements, ${parsedMap.log.join(", ")}`}
            />
          );
          return parsedMap;
        }
      }),
    [format, map, notify, useLoadingState, theme]
  );
}
