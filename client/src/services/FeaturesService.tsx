import { mapParsers } from "components/renderer/map-parser";
import { keys, map, uniqBy } from "lodash";
import { useCallback } from "react";
import { useAsyncAbortable as useAsync } from "react-async-hook";
import { useConnections } from "slices/connections";
import { Features, useFeatures } from "slices/features";
import { useLoadingState } from "slices/loading";
import { timed, wait } from "utils/timed";

const withSource = (source: string) => (v: any) => ({ ...v, source });

export function FeaturesService() {
  const [connections] = useConnections();
  const [, setFeatures] = useFeatures();

  const getFeatures = useCallback(async () => {
    const features: Features = {
      algorithms: [],
      formats: keys(mapParsers).map((c) => ({
        id: c,
        source: "internal",
      })),
      traces: [],
      maps: [],
    };
    for (const { call, url } of connections) {
      for (const prop of ["algorithms", "formats", "maps", "traces"] as const) {
        const { result } = await timed(() => call(`features/${prop}`), 1000);
        features[prop] = uniqBy(
          [...features[prop], ...map(result, withSource(url))],
          "id"
        );
      }
    }
    return features;
  }, [connections]);

  useAsync(
    async (signal) => {
      while (true) {
        const features = await getFeatures();
        if (!signal.aborted) {
          setFeatures(() => features);
          await wait(1000);
        } else {
          return;
        }
      }
    },
    [connections, getFeatures, setFeatures]
  );

  return <></>;
}
