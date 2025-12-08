import { useSnackbar } from "components/generic/Snackbar";
import { useEffectWhenAsync } from "hooks/useEffectWhen";
import { useMapContent } from "hooks/useMapContent";
import { inferLayerName } from "layers";
import { MapLayer } from "layers/map";
import { controller as traceController } from "layers/trace";
import { find } from "lodash-es";
import { nanoid as id } from "nanoid";
import { withProduce } from "produce";
import { useMemo } from "react";
import { slice } from "slices";
import { useConnections } from "slices/connections";
import { useFeatures } from "slices/features";
import { set } from "utils/set";
import { Controller } from ".";
import { findConnection } from "./findConnection";
import { Trace } from "protocol/Trace-v140";
import { useOne } from "slices/useOne";

export const service = withProduce(({ value, produce, onChange }) => {
  const TraceLayerService = traceController.service;
  const notify = useSnackbar();
  const { algorithm, mapLayerKey, start, end } = value?.source ?? {};
  const layers = useOne(slice.layers);
  const [connections] = useConnections();
  const [{ algorithms }] = useFeatures();
  const mapLayer = useMemo(() => {
    if (mapLayerKey && algorithm) {
      return find(layers, {
        key: mapLayerKey,
      }) as MapLayer;
    }
  }, [mapLayerKey, algorithm, layers]);
  const { result: mapContent } = useMapContent(mapLayer?.source?.map);
  useEffectWhenAsync(
    async (signal) => {
      if (mapLayer && mapContent && algorithm) {
        const { format } = mapLayer?.source?.map ?? {};
        const { content } = mapContent ?? {};
        if (format && content) {
          const connection = await findConnection(
            connections,
            algorithm,
            format,
          );
          const algorithmInfo = find(algorithms, { id: algorithm });
          if (connection) {
            notify(
              `Executing ${inferLayerName(value)} using ${connection.name}...`,
            );
            const args = {
              format,
              instances: [
                {
                  start: start ?? 0,
                  end: end ?? 0,
                },
              ],
              mapURI: `map:${encodeURIComponent(content)}` as const,
              algorithm,
            };
            const result = await connection
              .transport()
              .call("solve/pathfinding", args);
            if (!signal.aborted) {
              produce((v) => {
                set(v, "source.trace", {
                  name: `${algorithmInfo?.name}`,
                  content: result as Trace | undefined,
                  key: id(),
                  id: id(),
                });
                set(v, "source.query", args);
              });
            } else {
              notify("Canceled");
            }
          }
        }
      }
    },
    [
      mapLayer,
      connections,
      algorithm,
      start,
      end,
      produce,
      notify,
      value,
      algorithms,
    ],
    [mapLayer, mapContent, connections, algorithm, start, end],
  );
  return <>{<TraceLayerService value={value} onChange={onChange} />}</>;
}) satisfies Controller["service"];
