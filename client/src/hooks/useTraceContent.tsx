import { useSnackbar } from "components/generic/Snackbar";
import { find } from "lodash";
import memo from "memoizee";
import { useMemo } from "react";
import { useAsync } from "react-async-hook";
import { UploadedTrace } from "slices/UIState";
import { useFeatures } from "slices/features";
import { useLoadingState } from "slices/loading";
import { useConnectionResolver } from "./useConnectionResolver";

export function useTraceContent(trace?: UploadedTrace) {
  const notify = useSnackbar();
  const usingLoadingState = useLoadingState("specimen");
  const resolve = useConnectionResolver();
  const [{ traces }] = useFeatures();

  const getTrace = useMemo(
    () =>
      memo(
        async ({ source, id }: UploadedTrace) => {
          if (source && id) {
            const connection = resolve({ url: source });
            if (connection) {
              notify("Fetching trace...");
              const result = await connection
                .transport()
                .call("features/trace", { id });
              console.log(result?.content);
              return result?.content;
            }
          }
        },
        { normalizer: JSON.stringify }
      ),
    [resolve, notify]
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
    [getTrace, !!content, key, source, id, lastModified]
  );
}
