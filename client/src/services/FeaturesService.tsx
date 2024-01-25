import { mapParsers } from "components/renderer/map-parser";
import {
  Dictionary,
  chain as _,
  isArray,
  keys,
  map,
  mergeWith,
  uniqBy,
} from "lodash";
import { useAsyncAbortable as useAsync } from "react-async-hook";
import { Connection, useConnections } from "slices/connections";
import { Features, useFeatures } from "slices/features";
import { useLoading } from "slices/loading";
import { timed } from "utils/timed";

function withSource<T>(source: string) {
  return (v: T) => ({ ...v, source });
}

const getFeatures = async ({ transport, url }: Connection) => {
  const a = _(["algorithms", "formats", "maps", "traces"] as const)
    .map(async (prop) => {
      const { result } = await timed(
        () => transport().call(`features/${prop}`),
        1000
      );
      return { prop, result: map(result, withSource(url)) };
    })
    .value();
  const b = await Promise.all(a);
  return _(b).keyBy("prop").mapValues("result").value() as Features;
};

export function FeaturesService() {
  const [connections] = useConnections();
  const [, setFeatures] = useFeatures();
  const [{ connections: connectionsLoading }] = useLoading();

  useAsync(
    async (signal) => {
      if (!connectionsLoading) {
        const features: Dictionary<Features> = {
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
            const merged = _(features)
              .values()
              .reduce((prev, next) =>
                mergeWith({}, prev, next, (obj, src) =>
                  isArray(obj) ? uniqBy([...obj, ...src], "id") : undefined
                )
              )
              .value();
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
      }
    },
    [connections, getFeatures, setFeatures, connectionsLoading]
  );

  return <></>;
}
