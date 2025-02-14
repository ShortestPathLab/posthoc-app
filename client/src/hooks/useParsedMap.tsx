import { useTheme } from "@mui/material";
import { useSnackbar } from "components/generic/Snackbar";
import { getParser } from "components/renderer";
import { get } from "lodash";
import objectHash from "object-hash";
import { useAsync } from "react-async-hook";
import { Map } from "slices/UIState";
import { useLoadingState } from "slices/loading";

export function useParsedMap(map?: Map, options?: Record<string, any>) {
  const notify = useSnackbar();
  const theme = useTheme();
  const usingLoadingState = useLoadingState("layers");

  const { format, content } = map ?? {};

  return useAsync(
    () =>
      usingLoadingState(async () => {
        if (format && content) {
          notify("Processing map...");
          try {
            const parsedMap = (await getParser(format)?.parse?.(content, {
              color: theme.palette.text.primary,
              background: theme.palette.background.paper,
              ...options,
            })) ?? { nodes: [] };

            notify(
              "Map loaded",
              `${parsedMap.nodes.length} elements, ${parsedMap.log.join(", ")}`
            );
            return { ...map, ...parsedMap };
          } catch (e) {
            console.error(e);
            notify("Error parsing", get(e, "message"));
            return { error: get(e, "message") };
          }
        }
      }),
    [format, content, theme, objectHash(options ?? {})]
  );
}
