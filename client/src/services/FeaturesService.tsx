import { mapParsers } from "components/renderer/map-parser";
import { useConnectionsLoading } from "hooks/useConnectionStatus";
import {
  isArray,
  keyBy,
  keys,
  map,
  mapValues,
  // map,
  mergeWith,
  reduce,
  uniqBy,
  values,
} from "lodash-es";
import { map as mapAsync } from "promise-tools";
import { useAsyncAbortable as useAsync } from "react-async-hook";
import { Connection, useConnections } from "slices/connections";
import { Features, useFeatures } from "slices/features";
import { useLoadingState } from "slices/loading";
import { timed } from "utils/timed";
import { _ } from "utils/chain";
function withSource<T>(source: string) {
  return (v: T) => ({ ...v, source });
}

const getFeatures = async ({ transport, url }: Connection) => {
  return _(
    await mapAsync(
      ["algorithms", "formats", "maps", "traces"] as const,
      async (prop) => {
        const { result } = await timed(
          () => transport().call(`features/${prop}`),
          1000
        );
        return { prop, result: map(result, withSource(url)) };
      }
    ),
    (v) => keyBy(v, "prop"),
    (v) => mapValues(v, "result")
  ) as Features;
};

export function FeaturesService() {
  const [connections] = useConnections();
  const [, setFeatures] = useFeatures();
  const loading = useConnectionsLoading();
  const usingLoadingState = useLoadingState("features");

  useAsync(
    async (signal) => {
      usingLoadingState(async () => {
        if (loading) return;
        const features: Record<string, Features> = {
          default: {
            algorithms: [],
            formats: keys(mapParsers).map((c) => ({
              id: c,
              source: "internal",
            })),
            traces: [],
            maps: [],
          },
        };
        const reload = () => {
          if (!signal.aborted) {
            const merged = _(features, values, (v) =>
              reduce(v, (prev, next) =>
                mergeWith({}, prev, next, (obj, src) =>
                  isArray(obj) ? uniqBy([...obj, ...src], "id") : undefined
                )
              )
            );
            setFeatures(() => merged);
          }
        };
        for (const connection of connections) {
          const f = async () => {
            features[connection.url] = await getFeatures(connection);
            reload();
          };
          connection.transport().on("features/changed", f);
          f();
        }
      });
    },
    [connections, getFeatures, setFeatures, loading]
  );

  return <></>;
}
