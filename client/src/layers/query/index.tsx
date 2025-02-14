import {
  CodeOutlined,
  LocationOnOutlined as DestinationIcon,
  RouteOutlined,
  TripOriginOutlined as StartIcon,
} from "@mui-symbols-material/w400";
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
  chain as _,
  find,
  isArray,
  isObject,
  map,
  mapValues,
  merge,
  omit,
  pick,
  reduce,
  truncate,
} from "lodash";
import { nanoid as id } from "nanoid";
import { withProduce } from "produce";
import { useMemo } from "react";
import { slice } from "slices";
import { Connection, useConnections } from "slices/connections";
import { useFeatures } from "slices/features";
import { Layer, WithLayer, useLayerPicker } from "slices/layers";
import { set } from "utils/set";
import { LayerPicker } from "../../components/generic/LayerPicker";

function mapValuesDeep<T, U>(v: T, callback: (t: unknown) => any): U {
  return isArray(v)
    ? (map(v, (v) => mapValuesDeep(v, callback)) as U)
    : isObject(v)
    ? (mapValues(v, (v) => mapValuesDeep(v, callback)) as U)
    : (callback(v) as U);
}

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
const isMapLayer = (c: Layer<unknown>): c is MapLayer =>
  c.source?.type === "map";
export const controller = {
  ...omit(traceController, "claimImportedFile"),
  key: "query",
  icon: <RouteOutlined />,
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
    const { key: mapLayerKey } = useLayerPicker(isMapLayer);
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
                produce((p) => void set(p, "source.algorithm", v))
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
            <LayerPicker<MapLayerData>
              paper
              value={mapLayerKey}
              guard={isMapLayer}
              onChange={(v) => produce((p) => set(p, "source.mapLayerKey", v))}
            />
          }
        />
        <WithLayer<Layer<MapLayerData>> layer={mapLayerKey}>
          {(l) => (
            <Type
              component="div"
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, mt: 1 }}
            >
              Define source and destination nodes by clicking on valid regions
              on {inferLayerName(l)}
            </Type>
          )}
        </WithLayer>

        <Heading label="Preview" />
        <Box sx={{ height: 240, mx: -2 }}>
          <TracePreview trace={value?.source?.trace?.content} />
        </Box>
      </>
    );
  }),
  service: withProduce(({ value, produce, onChange }) => {
    "use no memo";
    const TraceLayerService = traceController.service;
    const notify = useSnackbar();
    const { algorithm, mapLayerKey, start, end } = value?.source ?? {};
    const layers = slice.layers.use();
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
    "use no memo";
    const TraceLayerSelectionInfoProvider =
      traceController.provideSelectionInfo;
    const { use: useLayer, set: setLayer } = slice.layers.one(key);
    const layer = useLayer();
    const layers = slice.layers.use();
    const mapLayerData = useMemo(
      () =>
        _(layers)
          .map((l) => {
            if (!isMapLayer(l)) return;
            const { parsedMap } = l?.source ?? {};
            if (!parsedMap || !event) return;
            const hydratedMap = getParser(l?.source?.map?.format)?.hydrate?.(
              parsedMap
            );
            if (!hydratedMap) return;
            const point = event?.world && hydratedMap.snap(event.world);
            if (!point) return;
            const node = event?.world && hydratedMap.nodeAt(point);
            return {
              point,
              node,
              key: l.key,
              name: inferLayerName(l),
            };
          })
          .filter()
          .value(),
      [layers]
    );
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
                      setLayer((l) => {
                        set(l, "source.start", next?.node);
                        set(l, "source.query", undefined);
                        set(l, "source.mapLayerKey", next?.key);
                        set(l, "source.trace", undefined);
                      }),
                    icon: <StartIcon sx={{ transform: "scale(0.5)" }} />,
                  },
                  [`${key}-${next?.key}-destination`]: {
                    primary: `Set as destination`,
                    secondary: next?.name,
                    action: () =>
                      setLayer((l) => {
                        set(l, "source.end", next?.node);
                        set(l, "source.query", undefined);
                        set(l, "source.mapLayerKey", next?.key);
                        set(l, "source.trace", undefined);
                      }),
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
        readonly: true,
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
