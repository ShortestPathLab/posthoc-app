import {
  LocationOnOutlined as DestinationIcon,
  TripOriginOutlined as StartIcon,
} from "@mui-symbols-material/w400";
import { getParser } from "components/renderer";
import { inferLayerName } from "layers";
import { controller as traceController } from "layers/trace";
import { identity, merge, reduce } from "lodash-es";
import { useMemo } from "react";
import { slice } from "slices";
import { set } from "utils/set";
import { Controller } from ".";
import { isMapLayer } from "./isMapLayer";
import { useOne } from "slices/useOne";

export const provideSelectionInfo = (({ children, event, layer: key }) => {
  const TraceLayerSelectionInfoProvider = traceController.provideSelectionInfo;
  const { use: useLayer, set: setLayer } = slice.layers.one(key);
  const layer = useLayer();
  const layers = useOne(slice.layers);
  const mapLayerData = useMemo(
    () =>
      layers
        .map((l) => {
          if (!isMapLayer(l)) return;
          const { parsedMap } = l?.source ?? {};
          if (!parsedMap || !event) return;
          const hydratedMap = getParser(l?.source?.map?.format)?.hydrate?.(
            parsedMap,
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
        .filter(identity),
    [layers],
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
              {},
            ),
          },
        },
      },
    [mapLayerData, layer, layers, setLayer],
  );
  return (
    <TraceLayerSelectionInfoProvider event={event} layer={key}>
      {(menuB) => children?.(merge(menuB, menu))}
    </TraceLayerSelectionInfoProvider>
  );
}) satisfies Controller["provideSelectionInfo"];
