import { ArrowOutwardRounded, DataObjectOutlined } from "@mui-symbols-material/w300";
import { PropertyList, showEventProperties } from "components/inspector/PropertyList";
import { inferLayerName } from "layers";
import { isUndefined, last, negate } from "es-toolkit";
import { keyBy, map, startCase } from "es-toolkit/compat";
import { useMemo } from "react";
import { slice } from "slices";
import { set } from "utils/set";
import { TraceLayer } from "./TraceLayer";
import { Controller } from "./types";
import { useOne } from "slices/useOne";

export const provideSelectionInfo = (({ layer: key, event, children }) => {
  const one = useMemo(() => slice.layers.one<TraceLayer>(key), [key]);
  const layer = useOne(one);
  const menu = useMemo(() => {
    const events = layer?.source?.parsedTrace?.content?.events ?? [];
    const steps = (event?.info?.components ?? [])
      .filter((c) => c.meta?.sourceLayer === layer?.key)
      .map((c) => c.meta?.step)
      .filter(negate(isUndefined))
      .sort((a, b) => a! - b!);
    const info = (event?.info?.components ?? [])
      .filter((c) => c.meta?.sourceLayer === layer?.key)
      .filter((c) => c.meta?.info);
    if (steps.length && layer) {
      const step = last(steps)!;
      const event = events[step];
      if (event) {
        return {
          ...keyBy(
            map(info, (x, i) => ({
              key: `${layer.key}.${i}`,
              primary: `Selection in ${inferLayerName(layer)}`,
              items: {
                info: {
                  index: -1,
                  primary: <PropertyList event={x.meta?.info} vertical />,
                },
              },
            })),
            "key",
          ),
          [layer.key]: {
            primary: inferLayerName(layer),
            items: {
              properties: {
                index: -2,
                primary: <PropertyList event={event} vertical simple primitives />,
              },
              propertiesDetails: {
                index: -1,
                primary: "See properties",
                secondary: `Step ${step}`,
                icon: <DataObjectOutlined />,
                action: () => showEventProperties(event),
              },
              [`${event}`]: {
                primary: `Go to step ${step}`,
                secondary: `${startCase(event.type)}`,
                action: () => one.set((l) => void set(l, "source.step", step)),
                icon: <ArrowOutwardRounded />,
              },
            },
          },
        };
      }
    }
    return {};
  }, [layer, event, one]);
  return <>{children?.(menu)}</>;
}) satisfies Controller["provideSelectionInfo"];
