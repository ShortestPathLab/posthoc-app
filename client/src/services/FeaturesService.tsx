import { keys, map, uniqBy } from "lodash";
import { useAsyncAbortable as useAsync } from "react-async-hook";
import { mapParsers } from "components/renderer/map-parser";
import { useConnections } from "slices/connections";
import { Features, useFeatures } from "slices/features";
import { useLoadingState } from "slices/loading";

const withSource = (source: string) => (v: any) => ({ ...v, source });

export function FeaturesService() {
  const [connections] = useConnections();
  const [, setFeatures] = useFeatures();
  const usingLoadingState = useLoadingState("features");

  useAsync(
    (signal) =>
      usingLoadingState(async () => {
        const features: Features = {
          algorithms: [],
          formats: keys(mapParsers).map((c) => ({
            id: c,
            source: "internal",
          })),
          maps: [],
        };
        for (const { call, url } of connections) {
          for (const prop of ["algorithms", "formats", "maps"] as const) {
            features[prop] = uniqBy(
              [
                ...features[prop],
                ...map(await call(`features/${prop}`), withSource(url)),
              ],
              "id"
            );
          }
        }
        if (!signal.aborted) setFeatures(features);
      }),
    [connections, setFeatures]
  );

  return <></>;
}