import {
  CodeOutlined,
  PlaceOutlined as DestinationIcon,
  LayersOutlined,
  RouteTwoTone,
  TripOriginOutlined as StartIcon,
} from "@mui/icons-material";
import { Box, Typography as Type } from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { useSnackbar } from "components/generic/Snackbar";
import { Heading, Option } from "components/layer-editor/Option";
import { TracePreview } from "components/layer-editor/TracePreview";
import { getParser } from "components/renderer";
import { useEffectWhenAsync } from "hooks/useEffectWhen";
import { useMapContent } from "hooks/useMapContent";
import { dump } from "js-yaml";
import { LayerController, inferLayerName } from "layers";
import { MapLayer, MapLayerData } from "layers/map";
import { TraceLayerData, controller as traceController } from "layers/trace";
import {
  filter,
  find,
  isArray,
  isObject,
  map,
  mapValues,
  merge,
  omit,
  pick,
  reduce,
  set,
  truncate,
} from "lodash";
import { nanoid as id } from "nanoid";
import { produce, withProduce } from "produce";
import { useMemo } from "react";
import { Connection, useConnections } from "slices/connections";
import { useFeatures } from "slices/features";
import { Layer, useLayer, useLayers } from "slices/layers";

const mapValuesDeep = (v: any, callback: (t: any) => any): any =>
  isArray(v)
    ? map(v, (v) => mapValuesDeep(v, callback))
    : isObject(v)
    ? mapValues(v, (v) => mapValuesDeep(v, callback))
    : callback(v);
async function findConnection(
  connections: Connection[],
  algorithm: string,
  format: string
) {
  for (const connection of connections) {
    const algorithms = await connection.transport().call("features/algorithms");
    const formats = await connection.transport().call("features/formats");
    if (find(algorithms, { id: algorithm }) && find(formats, { id: format })) {
      return connection;
    }
  }
}

export type QueryLayerData = {
  mapLayerKey?: string;
  query?: any;
  start?: number;
  end?: number;
  algorithm?: string;
} & TraceLayerData;

const maxStringPropLength = 40;
export const controller = {
  ...omit(traceController, "claimImportedFile"),
  key: "query",
  icon: <RouteTwoTone />,
  compress: (layer) =>
    pick(layer, [
      "mapLayerKey",
      "query",
      "start",
      "end",
      "algorithm",
      "onion",
      "step",
      "code",
      "breakpoints",
    ]),
  editor: withProduce(({ value, produce }) => {
    const { algorithm } = value?.source ?? {};
    const {
      layers,
      allLayers,
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
              arrow
              paper
              icon={<CodeOutlined />}
              label="Algorithm"
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
          <Type
            component="div"
            variant="body2"
            color="warning.main"
            sx={{ mb: 1 }}
          >
            No connected solver has declared support for running algorithms
          </Type>
        )}
        <Option
          label="Map"
          content={
            <FeaturePicker
              arrow
              paper
              icon={<LayersOutlined />}
              label="Layer"
              value={mapLayerKey}
              items={allLayers.map((c) => ({
                id: c.key,
                hidden: !find(layers, (d) => d.key === c.key),
                name: inferLayerName(c),
              }))}
              onChange={async (v) =>
                produce((p) => set(p, "source.mapLayerKey", v))
              }
            />
          }
        />
        {selectedLayer && (
          <Type
            component="div"
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, mt: 1 }}
          >
            Define source and destination nodes by clicking on valid regions on{" "}
            {inferLayerName(selectedLayer)}
          </Type>
        )}
        <Heading label="Preview" />
        <Box sx={{ height: 240, mx: -2 }}>
          <TracePreview trace={value?.source?.trace?.content} />
        </Box>
      </>
    );
  }),
  service: withProduce(({ value, produce, onChange }) => {
    const TraceLayerService = traceController.service;
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
              format
            );
            const algorithmInfo = find(algorithms, { id: algorithm });
            if (connection) {
              notify(
                `Executing ${inferLayerName(value)} using ${connection.name}...`
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
                    content: result,
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
      [mapLayer, mapContent, connections, algorithm, start, end]
    );
    return <>{<TraceLayerService value={value} onChange={onChange} />}</>;
  }),
  inferName: (l) => l.source?.trace?.name ?? "Untitled Query",
  provideSelectionInfo: ({ children, event, layer: key }) => {
    const TraceLayerSelectionInfoProvider =
      traceController.provideSelectionInfo;
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
  getSources: (layer) => {
    const { algorithm = null, start = 0, end = 0, query } = layer?.source ?? {};

    return [
      {
        id: "params",
        name: "Query",
        language: "yaml",
        content: dump(
          {
            algorithm,
            instances: [{ start, end }],
            mapURI: "(...)",
            format: "(...)",
            ...mapValuesDeep(query, (t) =>
              typeof t === "string"
                ? t.length > maxStringPropLength
                  ? `${truncate(t, { length: maxStringPropLength })} (${
                      t.length
                    } characters)`
                  : t
                : t
            ),
          },
          { noCompatMode: true }
        ),
      },
      ...traceController.getSources(layer),
    ];
  },
} satisfies LayerController<"query", QueryLayerData>;
