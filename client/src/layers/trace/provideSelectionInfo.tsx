import {
  ArrowOutwardRounded,
  DataObjectOutlined,
} from "@mui-symbols-material/w400";
import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  PropertyDialog,
  PropertyList,
} from "components/inspector/PropertyList";
import { inferLayerName } from "layers";
import { isUndefined, keyBy, last, map, negate, startCase } from "lodash-es";
import { useMemo } from "react";
import { slice } from "slices";
import { set } from "utils/set";
import { TraceLayer } from "./TraceLayer";
import { Controller } from "./types";

export const provideSelectionInfo = (({ layer: key, event, children }) => {
  const one = slice.layers.one<TraceLayer>(key);
  const layer = one.use();
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
            "key"
          ),
          [layer.key]: {
            primary: inferLayerName(layer),
            items: {
              properties: {
                index: -2,
                primary: (
                  <PropertyList event={event} vertical simple primitives />
                ),
              },
              propertiesDetails: {
                index: -1,
                extras: (
                  <PropertyDialog
                    {...{ event }}
                    trigger={({ open }) => (
                      <MenuItem onClick={open}>
                        <ListItemIcon>
                          <DataObjectOutlined />
                        </ListItemIcon>
                        <ListItemText sx={{ mr: 4 }}>
                          See properties
                        </ListItemText>
                        <Typography
                          component="div"
                          variant="body2"
                          color="text.secondary"
                        >
                          Step {step}
                        </Typography>
                      </MenuItem>
                    )}
                  />
                ),
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
  }, [layer, event]);
  return <>{children?.(menu)}</>;
}) satisfies Controller["provideSelectionInfo"];
