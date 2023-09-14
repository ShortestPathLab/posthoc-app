import { MapPicker } from "components/app-bar/Input";
import { NodeList } from "components/render/renderer/generic/NodeList";
import { useMapContent } from "hooks/useMapContent";
import { useParsedMap } from "hooks/useParsedMap";
import {
  filter,
  isUndefined,
  map,
  noop,
  reduce,
  round,
  set,
  startCase,
} from "lodash";
import { withProduce } from "produce";
import { useMemo } from "react";
import { Map, useUIState } from "slices/UIState";
import { LayerSource, inferLayerName } from "./LayerSource";
import { Option } from "./Option";
import {
  PlaceOutlined as DestinationIcon,
  TripOriginOutlined as StartIcon,
} from "@mui/icons-material";

export const mapLayerSource: LayerSource<"map", { map?: Map }> = {
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
    const { result: mapContent } = useMapContent(layer?.source?.map);
    const { result: parsedMap } = useParsedMap(mapContent);

    const nodes = useMemo(() => [parsedMap?.nodes ?? []], [parsedMap]);

    return <NodeList nodes={nodes} />;
  },
  steps: ({ children }) => <>{children?.([])}</>,
  getSelectionInfo: ({ children, event, layer }) => {
    const [{ layers }] = useUIState();
    const a = filter(layers, { source: { type: "query" } });
    const { result: mapContent } = useMapContent(layer?.source?.map);
    const { result: parsedMap } = useParsedMap(mapContent);
    const { point, node } = useMemo(() => {
      if (parsedMap && event) {
        const point = event?.world && parsedMap.snap(event.world);
        if (point) {
          const node = event?.world && parsedMap.nodeAt(point);
          return { point, node };
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
                ...reduce(
                  a,
                  (p, n) => ({
                    ...p,
                    [`${n.key}-a`]: {
                      primary: `Set as source`,
                      secondary: inferLayerName(n),
                      action: noop,
                      icon: <StartIcon sx={{ transform: "scale(0.5)" }} />,
                    },
                    [`${n.key}-b`]: {
                      primary: `Set as destination`,
                      secondary: inferLayerName(n),
                      action: noop,
                      icon: <DestinationIcon />,
                    },
                  }),
                  {}
                ),
              },
            },
          }),
      }),
      [point, layer]
    );
    return <>{children?.(menu)}</>;
  },
};
