import { useSnackbar } from "components/generic/Snackbar";
import { memoize as memo } from "lodash";
import { useMemo } from "react";
import { useAsync } from "react-async-hook";
import { useLoadingState } from "slices/loading";
import { Map, useUIState } from "slices/UIState";
import { useConnectionResolver } from "./useConnectionResolver";

export function useMapContent() {
  const notify = useSnackbar();
  const usingLoadingState = useLoadingState("map");
  const resolve = useConnectionResolver();
  const [{ map }] = useUIState();

  const getMap = useMemo(
    () =>
      memo(async ({ source, id }: Map = {}) => {
        if (source && id) {
          const connection = resolve({ url: source });
          if (connection) {
            notify("Fetching map...");
            const result = await connection.call("features/map", { id });
            return result?.content;
          }
        }
      }, JSON.stringify),
    [resolve, notify]
  );

  return useAsync(
    () =>
      usingLoadingState(async () => {
        if (map && map.id)
          return {
            ...map,
            content: map.content ? map.content : await getMap(map),
          };
      }),
    [getMap, map, usingLoadingState]
  );
}
