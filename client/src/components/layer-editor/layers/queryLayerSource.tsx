import {
  CodeOutlined,
  PlaceOutlined as DestinationIcon,
  LayersOutlined,
  TripOriginOutlined as StartIcon,
} from "@mui/icons-material";
import { Box, Typography as Type } from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { useSnackbar } from "components/generic/Snackbar";
import { getParser } from "components/renderer";
import { filter, find, map, merge, reduce, set } from "lodash";
import { nanoid as id } from "nanoid";
import { produce, withProduce } from "produce";
import { useMemo } from "react";
import { Connection, useConnections } from "slices/connections";
import { useFeatures } from "slices/features";
import { Layer, useLayer, useLayers } from "slices/layers";
import { useEffectWhenAsync } from "../../../hooks/useEffectWhen";
import { LayerSource, inferLayerName } from "./LayerSource";
import { Heading, Option } from "./Option";
import { TracePreview } from "./TracePreview";
import { MapLayer, MapLayerData } from "./mapLayerSource";
import { TraceLayerData, traceLayerSource } from "./traceLayerSource";

const TraceLayerSelectionInfoProvider = traceLayerSource.getSelectionInfo!;

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
    const { algorithm } = value?.source ?? {};
    const {
      layers,
      layer: selectedLayer,
      key: mapLayerKey,
    } = useLayer(undefined, (c): c is MapLayer => c.source?.type === "map");
    const [{ algorithms }] = useFeatures();
    const [connections] = useConnections();
    return (
      <>
        <Option
          label="Algorithm"
          content={
            <FeaturePicker
              showArrow
              icon={<CodeOutlined />}
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
              icon={<LayersOutlined />}
              label="Choose Layer"
              value={mapLayerKey}
              items={layers.map((c) => ({
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
          <Type variant="body2" color="text.secondary" sx={{ mb: 1, mt: 1 }}>
            Define source and destination nodes by clicking on valid regions on{" "}
            {inferLayerName(selectedLayer)}
          </Type>
        )}
        <Heading label="Preview" />
        <Box sx={{ height: 240, mx: -2, mb: -2 }}>
          <TracePreview trace={value?.source?.trace?.content} />
        </Box>
      </>
    );
  }),
  service: withProduce(({ value, produce }) => {
    const notify = useSnackbar();
    const { algorithm, mapLayerKey, start, end } = value?.source ?? {};
    const [{ layers: layers }] = useLayers();
    const [connections] = useConnections();
    const [{ algorithms }] = useFeatures();
    const mapLayer = useMemo(() => {
      if (mapLayerKey && algorithm) {
        return find(layers, {
          key: mapLayerKey,
        }) as MapLayer;
      }
    }, [mapLayerKey, algorithm, layers]);
    useEffectWhenAsync(
      async (signal) => {
        if (mapLayer && algorithm) {
          const { format, content } = mapLayer?.source?.map ?? {};
          if (format && content) {
            const connection = await findConnection(
              connections,
              algorithm,
              format
            );
            const algorithmInfo = find(algorithms, { id: algorithm });
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
              if (!signal.aborted) {
                produce((v) =>
                  set(v, "source.trace", {
                    name: `${algorithmInfo?.name}`,
                    content: result,
                    key: id(),
                  })
                );
              } else {
                notify("Canceled.");
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
      [mapLayer, connections, algorithm, start, end]
    );
    return <>{traceLayerSource.service}</>;
  }),
  inferName: (l) => l.source?.trace?.name ?? "Untitled Query",
  renderer: traceLayerSource.renderer,
  steps: traceLayerSource.steps,
  getSelectionInfo: ({ children, event, layer: key }) => {
    const { layer, setLayer, layers } = useLayer<QueryLayerData>(key);
    const mapLayerData = useMemo(() => {
      const filteredLayers = filter(layers, {
        source: { type: "map" },
      }) as Layer<MapLayerData>[];
      return filter(
        map(filteredLayers, (mapLayer) => {
          const { parsedMap } = mapLayer?.source ?? {};
          if (parsedMap && event) {
            const hydratedMap = getParser(
              mapLayer?.source?.map?.format
            )?.hydrate?.(parsedMap);
            if (hydratedMap) {
              const point = event?.world && hydratedMap.snap(event.world);
              if (point) {
                const node = event?.world && hydratedMap.nodeAt(point);
                return {
                  point,
                  node,
                  key: mapLayer.key,
                  name: inferLayerName(mapLayer),
                };
              }
            }
          }
        })
      );
    }, [layers]);
    const menu = useMemo(
      () =>
        !!layer &&
        !!mapLayerData.length && {
          [layer.key]: {
            primary: inferLayerName(layer),
            items: {
              ...reduce(
                mapLayerData,
                (prev, next) => ({
                  ...prev,
                  [`${key}-${next?.key}-source`]: {
                    primary: `Set as source`,
                    secondary: next?.name,
                    action: () =>
                      setLayer(
                        produce(layer, (l) => {
                          set(l, "source.start", next?.node);
                          set(l, "source.query", undefined);
                          set(l, "source.mapLayerKey", next?.key);
                          set(l, "source.trace", undefined);
                        })
                      ),
                    icon: <StartIcon sx={{ transform: "scale(0.5)" }} />,
                  },
                  [`${key}-${next?.key}-destination`]: {
                    primary: `Set as destination`,
                    secondary: next?.name,
                    action: () =>
                      setLayer(
                        produce(layer, (l) => {
                          set(l, "source.end", next?.node);
                          set(l, "source.query", undefined);
                          set(l, "source.mapLayerKey", next?.key);
                          set(l, "source.trace", undefined);
                        })
                      ),
                    icon: <DestinationIcon />,
                  },
                }),
                {}
              ),
            },
          },
        },
      [mapLayerData, layer, layers, setLayer]
    );
    return (
      <TraceLayerSelectionInfoProvider event={event} layer={key}>
        {(menuB) => children?.(merge(menuB, menu))}
      </TraceLayerSelectionInfoProvider>
    );
  },
};
