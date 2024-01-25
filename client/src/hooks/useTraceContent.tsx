import { useSnackbar } from "components/generic/Snackbar";
import memo from "memoizee";
import { useMemo } from "react";
import { useAsync } from "react-async-hook";
import { UploadedTrace } from "slices/UIState";
import { useLoadingState } from "slices/loading";
import { useConnectionResolver } from "./useConnectionResolver";
import { find } from "lodash";
import { useFeatures } from "slices/features";

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
              return result?.content;
            }
          }
        },
        { normalizer: JSON.stringify }
      ),
    [resolve, notify]
  );

  const { content, source, id } = trace ?? {};
  const { lastModified } = find(traces, { id, source }) ?? {};

  return useAsync(
    () =>
      usingLoadingState(async () => {
        if (id)
          return {
            ...trace,
            content: content
              ? content
              : await getTrace({ source, id, lastModified }),
          };
      }),
    [getTrace, content, source, id, lastModified]
  );
}
