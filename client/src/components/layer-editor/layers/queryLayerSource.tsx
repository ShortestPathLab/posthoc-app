import { CodeOutlined as CodeIcon } from "@mui/icons-material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { useSnackbar } from "components/generic/Snackbar";
import { filter, find, set } from "lodash";
import { withProduce } from "produce";
import { useMemo } from "react";
import { Layer, useUIState } from "slices/UIState";
import { Connection, useConnections } from "slices/connections";
import { useFeatures } from "slices/features";
import { useEffectWhen } from "../../../hooks/useEffectWhen";
import { LayerSource, inferLayerName } from "./LayerSource";
import { Option } from "./Option";
import { MapLayerData } from "./mapLayerSource";
import { TraceLayerData, traceLayerSource } from "./traceLayerSource";
import { Typography as Type } from "@mui/material";

async function findConnection(
  connections: Connection[],
  algorithm: string,
  format: string
) {
  for (const connection of connections) {
    const algs = await connection.call("features/algorithms");
    const formats = await connection.call("features/formats");
    if (find(algs, { id: algorithm }) && find(formats, { id: format })) {
      return connection;
    }
  }
}
export type QueryLayerData = {
  mapLayerKey?: string;
  start?: number;
  end?: number;
  algorithm?: string;
} & TraceLayerData;

export const queryLayerSource: LayerSource<"query", QueryLayerData> = {
  key: "query",
  editor: withProduce(({ value, produce }) => {
    const { algorithm, mapLayerKey } = value?.source ?? {};
    const [{ layers }] = useUIState();
    const [{ algorithms }] = useFeatures();
    const [connections] = useConnections();
    const filteredLayers = filter(layers, (c) => c.source?.type === "map");
    const selectedLayer = find(filteredLayers, { key: mapLayerKey });
    return (
      <>
        <Option
          label="Algorithm"
          content={
            <FeaturePicker
              showArrow
              label="Choose Algorithm"
              value={algorithm}
              items={algorithms.map((c) => ({
                ...c,
                description: find(connections, { url: c.source })?.name,
              }))}
              onChange={async (v) =>
                produce((p) => set(p, "source.algorithm", v))
              }
            />
          }
        />
        {!algorithms?.length && (
          <Type variant="body2" color="warning.main" sx={{ mb: 1 }}>
            No connected solver has declared support for running algorithms
          </Type>
        )}
        <Option
          label="Map"
          content={
            <FeaturePicker
              showArrow
              label="Choose Layer"
              value={mapLayerKey}
              items={filteredLayers.map((c) => ({
                id: c.key,
                name: inferLayerName(c),
              }))}
              onChange={async (v) =>
                produce((p) => set(p, "source.mapLayerKey", v))
              }
            />
          }
        />
        {selectedLayer && (
          <Type variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Hint: Define source and destination nodes by clicking on valid
            regions on {inferLayerName(selectedLayer)}
          </Type>
        )}
      </>
    );
  }),
  service: withProduce(({ value, produce }) => {
    const notify = useSnackbar();
    const { algorithm, mapLayerKey, start, end } = value?.source ?? {};
    const [{ layers }] = useUIState();
    const [connections] = useConnections();
    const mapLayer = useMemo(() => {
      if (mapLayerKey && algorithm) {
        return find(layers, {
          key: mapLayerKey,
        }) as Layer<MapLayerData>;
      }
    }, [mapLayerKey, algorithm, layers]);
    useEffectWhen(
      async () => {
        if (mapLayer && algorithm) {
          const { format, content } = mapLayer?.source?.map ?? {};
          if (format && content) {
            const connection = await findConnection(
              connections,
              algorithm,
              format
            );
            if (connection) {
              notify(
                `Executing ${inferLayerName(value)} using ${connection.name}...`
              );
              const result = await connection.call("solve/pathfinding", {
                format,
                instances: [
                  {
                    start: start ?? 0,
                    end: end ?? 0,
                  },
                ],
                mapURI: `map:${encodeURIComponent(content)}`,
                algorithm,
              });
              produce((v) =>
                set(v, "source.trace", {
                  name: "Result",
                  content: result,
                })
              );
              notify("Ready.");
            }
          }
        }
      },
      [mapLayer, connections, algorithm, start, end, produce, notify, value],
      [mapLayer, connections, algorithm, start, end]
    );
    return <></>;
  }),
  inferName: () => "Untitled Query",
  renderer: traceLayerSource.renderer,
  steps: traceLayerSource.steps,
  getSelectionInfo: traceLayerSource.getSelectionInfo,
};
