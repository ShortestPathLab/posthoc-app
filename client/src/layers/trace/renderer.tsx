import { map, merge } from "lodash";
import { useMemo } from "react";
import { useThrottle } from "react-use";

import { LazyNodeList, NodeList } from "components/renderer/NodeList";
import { TraceLayer } from "./TraceLayer";
import { Controller } from "./types";
import { use2DPath } from "./use2DPath";

export interface RendererProps {
  layer?: TraceLayer;
  index?: number;
}

export const renderer = (({ layer, index }) => {
  const parsedTrace = layer?.source?.parsedTrace?.components;
  const step = useThrottle(layer?.source?.step ?? 0, 1000 / 60);

  const path = use2DPath(layer, index, step);
  const persistentSteps = useMemo(
    () =>
      map(parsedTrace?.stepsPersistent, (c) =>
        map(c, (d) =>
          merge({}, d, {
            meta: {
              sourceLayer: layer?.key,
              sourceLayerIndex: index,
              sourceLayerAlpha: 1 - 0.01 * +(layer?.transparency ?? 0),
              sourceLayerDisplayMode: layer?.displayMode ?? "source-over",
            },
          })
        )
      ),
    [
      parsedTrace?.stepsPersistent,
      layer?.key,
      layer?.transparency,
      layer?.displayMode,
      index,
    ]
  );
  const steps1 = useMemo(
    () =>
      map(parsedTrace?.stepsTransient, (c) =>
        map(c, (d) =>
          merge({}, d, {
            meta: {
              sourceLayer: layer?.key,
              sourceLayerIndex: index,
              sourceLayerAlpha: 1 - 0.01 * +(layer?.transparency ?? 0),
              sourceLayerDisplayMode: layer?.displayMode ?? "source-over",
            },
          })
        )
      ),
    [
      parsedTrace?.stepsTransient,
      layer?.key,
      layer?.transparency,
      layer?.displayMode,
      index,
    ]
  );
  const transientSteps = useMemo(() => [steps1[step] ?? []], [steps1, step]);
  return (
    <>
      <LazyNodeList end={step} nodes={persistentSteps} />
      <NodeList nodes={transientSteps} />
      {path}
    </>
  );
}) satisfies Controller["renderer"];
