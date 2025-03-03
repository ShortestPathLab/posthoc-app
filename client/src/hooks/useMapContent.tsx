import memo from "memoizee";
import { useAsync } from "react-async-hook";
import { useMemo } from "react";
import { useConnectionResolver } from "./useConnectionResolver";
import { useSnackbar } from "components/generic/Snackbar";
import { useLoadingState } from "slices/loading";
import { Map } from "slices/UIState";
import objectHash from "object-hash";

export function useMapContent(map?: Map) {
  const notify = useSnackbar();
  const usingLoadingState = useLoadingState("layers");
  const resolve = useConnectionResolver();

  const getMap = useMemo(
    () =>
      memo(
        async ({ source, id }: Map = {}) => {
          if (source && id) {
            const connection = resolve({ url: source });
            if (connection) {
              notify("Fetching map...");
              const result = await connection
                .transport()
                .call("features/map", { id });
              return result?.content;
            }
          }
        },
        { normalizer: (args) => objectHash([...args]) }
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
