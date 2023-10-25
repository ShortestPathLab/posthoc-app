import { MapPicker } from "components/app-bar/Input";
import { NodeList } from "components/render/renderer/generic/NodeList";
import { getParser } from "components/renderer";
import { ParsedMap } from "components/renderer/map-parser/Parser";
import { useEffectWhen } from "hooks/useEffectWhen";
import { useMapContent } from "hooks/useMapContent";
import { useParsedMap } from "hooks/useParsedMap";
import { isUndefined, round, set, startCase } from "lodash";
import { withProduce } from "produce";
import { useMemo } from "react";
import { Map } from "slices/UIState";
import { Layer, useLayer } from "slices/layers";
import { LayerSource, inferLayerName } from "./LayerSource";
import { Option } from "./Option";

export type MapLayerData = {
  map?: Map;
  parsedMap?: ParsedMap;
};

export type MapLayer = Layer<MapLayerData>;

export const mapLayerSource: LayerSource<"map", MapLayerData> = {
  key: "map",
  inferName: (layer) =>
    layer?.source?.map
      ? `${layer.source.map.name} (${startCase(layer.source.map.format)})`
      : "Untitled Map",
  editor: withProduce(({ value, produce }) => {
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
      </>
    );
  }),
  renderer: ({ layer }) => {
    const { nodes } = layer?.source?.parsedMap ?? {};
    const nodes2 = useMemo(() => [nodes ?? []], [nodes]);
    return <NodeList nodes={nodes2} />;
  },
  steps: ({ children }) => <>{children?.([])}</>,
  service: withProduce(({ value, produce }) => {
    const { result: mapContent } = useMapContent(value?.source?.map);
    const { result: parsedMap } = useParsedMap(mapContent);
    useEffectWhen(
      () => void produce((v) => set(v, "source.parsedMap", parsedMap)),
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
    const menu = useMemo(() => {
      return {
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
      };
    }, [point, node, layer, layers, setLayer]);
    return <>{children?.(menu)}</>;
  },
};
