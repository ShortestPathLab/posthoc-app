import { useSnackbar } from "components/generic/Snackbar";
import memo from "memoizee";
import { useMemo } from "react";
import { useAsync } from "react-async-hook";
import { useLoadingState } from "slices/loading";
import { Map, useUIState } from "slices/UIState";
import { useConnectionResolver } from "./useConnectionResolver";

export function useMapContent(map?: Map) {
  const notify = useSnackbar();
  const usingLoadingState = useLoadingState("map");
  const resolve = useConnectionResolver();

  const getMap = useMemo(
    () =>
      memo(
        async ({ source, id }: Map = {}) => {
          if (source && id) {
            const connection = resolve({ url: source });
            if (connection) {
              notify("Fetching map...");
              const result = await connection.call("features/map", { id });
              return result?.content;
            }
          }
        },
        { normalizer: JSON.stringify }
      ),
    [resolve, notify]
  );

  const { content, source, id } = map ?? {};

  return useAsync(
    () =>
      usingLoadingState(async () => {
        if (id)
          return {
            ...map,
            content: content ? content : await getMap({ source, id }),
          };
      }),
    [getMap, content, source, id]
  );
}
