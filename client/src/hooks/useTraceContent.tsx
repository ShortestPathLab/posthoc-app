import { useSnackbar } from "components/generic/Snackbar";
import { find } from "es-toolkit/compat";
import memo from "memoizee";
import { useMemo } from "react";
import { useAsync } from "react-async-hook";
import { slice } from "slices";
import { UploadedTrace } from "slices/UIState";
import { useLoadingState } from "slices/loading";
import { useOne } from "slices/useOne";
import { useConnectionResolver } from "./useConnectionResolver";
import objectHash from "object-hash";

export function useTraceContent(trace?: UploadedTrace) {
  const notify = useSnackbar();
  const usingLoadingState = useLoadingState("layers");
  const resolve = useConnectionResolver();
  const { traces } = useOne(slice.features);

  const getTrace = useMemo(
    () =>
      memo(
        async ({ source, id }: UploadedTrace) => {
          if (source && id) {
            const connection = resolve({ url: source });
            if (connection) {
              notify("Fetching trace...");
              const result = await connection.transport().call("features/trace", { id });
              return result?.content;
            }
          }
        },
        { normalizer: (args) => objectHash([...args]) },
      ),
    [resolve, notify],
  );

  const { content, source, id, key } = trace ?? {};
  const { lastModified } = find(traces, { id, source }) ?? {};

  return useAsync(
    () =>
      usingLoadingState(async () => {
        if (id) {
          if (content) {
            return { ...trace, content };
          } else {
            const a = await getTrace({ source, id, lastModified });
            return {
              ...trace,
              content: a,
            };
          }
        }
      }),
    [getTrace, !!content, key, source, id, lastModified],
  );
}
