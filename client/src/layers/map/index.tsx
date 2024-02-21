import { CircularProgress } from "@mui/material";
import { MapPicker } from "components/app-bar/Input";
import { Heading, Option } from "components/layer-editor/Option";
import { getParser } from "components/renderer";
import { NodeList } from "components/renderer/NodeList";
import { ParsedMap } from "components/renderer/map-parser/Parser";
import { useEffectWhen } from "hooks/useEffectWhen";
import { useMapContent } from "hooks/useMapContent";
import { useMapOptions } from "hooks/useMapOptions";
import { useParsedMap } from "hooks/useParsedMap";
import { LayerController, inferLayerName } from "layers";
import { isUndefined, map, round, set, startCase } from "lodash";
import { nanoid as id } from "nanoid";
import { withProduce } from "produce";
import { useMemo } from "react";
import { Map } from "slices/UIState";
import { Layer, useLayer } from "slices/layers";

export type MapLayerData = {
  map?: Map;
  options?: Record<string, any>;
  parsedMap?: ParsedMap;
};

export type MapLayer = Layer<MapLayerData>;

export const controller = {
  key: "map",
  inferName: (layer) =>
    layer?.source?.map
      ? `${layer.source.map.name} (${startCase(layer.source.map.format)})`
      : "Untitled Map",
  editor: withProduce(({ value, produce }) => {
    const { result: Editor } = useMapOptions(value?.source?.map);
    return (
      <>
        <Option
          label="Source"
          content={
            <MapPicker
              value={value?.source?.map}
              onChange={(v) => produce((d) => set(d, "source.map", v))}
            />
          }
        />
        {!!value?.source?.map && (
          <>
            <Heading label="Map Options" />
            {Editor ? (
              <Editor
                value={value?.source?.options}
                onChange={(v) =>
                  produce((prev) => {
                    set(prev, "source.options", v(prev.source?.options ?? {}));
                  })
                }
              />
            ) : (
              <CircularProgress sx={{ mt: 2 }} />
            )}
          </>
        )}
      </>
    );
  }),
  renderer: ({ layer, index }) => {
    const { nodes } = layer?.source?.parsedMap ?? {};
    const nodes2 = useMemo(
      () => [
        map(nodes, (n) => ({
          ...n,
          meta: {
            ...n.meta,
            sourceLayer: layer?.key,
            sourceLayerIndex: index,
            sourceLayerAlpha: 1 - 0.01 * +(layer?.transparency ?? 0),
            sourceLayerDisplayMode: layer?.displayMode ?? "source-over",
          },
        })),
      ],
      [nodes, index, layer?.transparency, layer?.displayMode]
    );
    return <NodeList nodes={nodes2} />;
  },
  service: withProduce(({ value, produce }) => {
    const { result: mapContent } = useMapContent(value?.source?.map);
    const { result: parsedMap } = useParsedMap(
      mapContent,
      value?.source?.options
    );
    useEffectWhen(
      () =>
        void produce((v) => {
          set(v, "source.parsedMap", parsedMap);
          set(v, "viewKey", id());
        }),
      [parsedMap, produce],
      [parsedMap]
    );
    return <></>;
  }),
  getSelectionInfo: ({ children, event, layer: key }) => {
    const { layer, setLayer, layers } = useLayer<MapLayerData>(key);
    const { parsedMap } = layer?.source ?? {};
    const { point, node } = useMemo(() => {
      if (parsedMap && event) {
        const hydratedMap = getParser(layer?.source?.map?.format)?.hydrate?.(
          parsedMap
        );
        if (hydratedMap) {
          const point = event?.world && hydratedMap.snap(event.world);
          if (point) {
            const node = event?.world && hydratedMap.nodeAt(point);
            return { point, node };
          }
        }
      }
      return {};
    }, [parsedMap, event]);
    const menu = useMemo(
      () => ({
        ...(layer &&
          point &&
          !isUndefined(node) && {
            [layer.key]: {
              primary: inferLayerName(layer),
              items: {
                point: {
                  primary: "Point",
                  secondary: `(${round(point.x, 2)}, ${round(point.y, 2)})`,
                },
              },
            },
          }),
      }),
      [point, node, layer, layers, setLayer]
    );
    return <>{children?.(menu)}</>;
  },
} satisfies LayerController<"map", MapLayerData>;
