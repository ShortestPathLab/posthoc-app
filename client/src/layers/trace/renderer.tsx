import { map, merge } from "es-toolkit/compat";
import { useCallback, useMemo } from "react";
import { useThrottle } from "react-use";

import { NodeList, PersistentNodes } from "components/renderer/NodeList";
import { StreamingPersistentNodes } from "components/renderer/StreamingPersistentNodes";
import { ComponentEntry } from "renderer";
import { TraceLayer } from "./TraceLayer";
import { getStreamBuffers, TraceStreamHandle } from "./traceStreamStore";
import { Controller } from "./types";
import { use2DPath } from "./use2DPath";

export interface RendererProps {
  layer?: TraceLayer;
  index?: number;
}

const metaFor = (layer?: TraceLayer, index?: number) => ({
  sourceLayer: layer?.key,
  sourceLayerIndex: index,
  sourceLayerAlpha: 1 - 0.01 * +(layer?.transparency ?? 0),
  sourceLayerDisplayMode: layer?.displayMode ?? "source-over",
});

/**
 * Streaming renderer (v1.4.0 trusted). Reads frame components from the external
 * buffer store and reacts to `stream.version`/`frontier`. Layer meta is applied
 * at *add-time* (here and in `StreamingPersistentNodes`) instead of by re-mapping
 * the whole component arrays on every change — the latter would be O(n) per
 * commit (O(n²) over a stream).
 */
function StreamingRenderer({
  layer,
  index,
  stream,
}: RendererProps & { stream: TraceStreamHandle }) {
  const step = useThrottle(layer?.source?.step ?? 0, 1000 / 60);
  const path = use2DPath(layer, index, step);

  const buffers = getStreamBuffers(stream.streamKey);
  const { version, frontier } = stream;
  const metaKey = `${layer?.key}:${index}:${layer?.transparency}:${layer?.displayMode}`;

  const decorate = useCallback(
    (entries: ComponentEntry[]) => {
      const meta = metaFor(layer, index);
      return map(entries, (d) => merge({}, d, { meta }));
    },
    [layer, index],
  );

  // Transient at the playhead: fully-merged when within the contiguous frontier,
  // otherwise the (approximate) own-frame components as a partial preview.
  // Computed inline (not memoized): `version` changing re-renders this component,
  // and the work is a couple of array reads. `version` is referenced so the
  // dependency is explicit to readers even though buffers mutate in place.
  void version;
  let transient: ComponentEntry[] = [];
  if (buffers) {
    const merged = step < frontier ? buffers.mergedTransient[step] : undefined;
    transient = merged ?? (buffers.generated[step] ? buffers.transientOwn[step] : undefined) ?? [];
  }
  const transientSteps = [decorate(transient)];

  return (
    <>
      <StreamingPersistentNodes
        buffers={buffers}
        step={step}
        version={version}
        metaKey={metaKey}
        decorate={decorate}
      />
      <NodeList nodes={transientSteps} />
      {path}
    </>
  );
}

/** One-shot renderer (legacy formats / untrusted layers). Behaviour unchanged. */
function LegacyRenderer({ layer, index }: RendererProps) {
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
          }),
        ),
      ),
    [parsedTrace?.stepsPersistent, layer?.key, layer?.transparency, layer?.displayMode, index],
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
          }),
        ),
      ),
    [parsedTrace?.stepsTransient, layer?.key, layer?.transparency, layer?.displayMode, index],
  );
  const transientSteps = useMemo(() => [steps1[step] ?? []], [steps1, step]);
  return (
    <>
      <PersistentNodes step={step} nodes={persistentSteps} />
      <NodeList nodes={transientSteps} />
      {path}
    </>
  );
}

export const renderer = (({ layer, index }) => {
  const stream = layer?.source?.parsedTrace?.stream;
  return stream ? (
    <StreamingRenderer layer={layer} index={index} stream={stream} />
  ) : (
    <LegacyRenderer layer={layer} index={index} />
  );
}) satisfies Controller["renderer"];
