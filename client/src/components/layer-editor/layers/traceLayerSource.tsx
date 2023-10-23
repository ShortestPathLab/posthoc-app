import { ArrowOutwardRounded } from "@mui/icons-material";
import { Box, useTheme } from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { TracePicker } from "components/app-bar/Input";
import { PropertyList } from "components/inspector/PropertyList";
import {
  LazyNodeList,
  NodeList,
} from "components/render/renderer/generic/NodeList";
import { colorsHex, getColorHex } from "components/renderer/colors";
import { parseString } from "components/renderer/parser/parseString";
import { useTraceMemo } from "components/renderer/parser/parseTrace";
import {
  chain,
  constant,
  findLast,
  forEach,
  head,
  isUndefined,
  last,
  map,
  merge,
  negate,
  pick,
  set,
  startCase,
} from "lodash";
import { withProduce } from "produce";
import { Trace, TraceEvent } from "protocol";
import { useMemo } from "react";
import { useThrottle } from "react-use";
import { Layer, UploadedTrace } from "slices/UIState";
import { usePlayback } from "slices/playback";
import { useTraceContent } from "../../../hooks/useTraceContent";
import { LayerSource, inferLayerName } from "./LayerSource";
import { Heading, Option } from "./Option";
import { TracePreview } from "./TracePreview";

const isNullish = (x: KeyRef): x is Exclude<KeyRef, Key> =>
  x === undefined || x === null;

type Key = string | number;

type KeyRef = Key | null | undefined;

function makePathIndex(trace: Trace) {
  type A = {
    id: Key;
    pId?: KeyRef;
    step: number;
    prev?: A;
  };

  const changes: A[] = [];
  const allChanges: { [K in Key]: KeyRef } = {};
  const stepToChange: { [K in number]?: A } = {};

  const r = chain(trace?.events)
    .map((c, i) => ({ step: i, id: c.id, pId: c.pId }))
    .groupBy("id")
    .value();

  forEach(trace?.events, ({ id, pId }, i) => {
    if (!isNullish(pId) && allChanges[id] !== pId) {
      changes.push({ id, pId, step: i, prev: last(changes) });
      allChanges[id] = pId;
    }
    stepToChange[i] = last(changes);
  });
  const getParent = (id: Key, step: number = trace?.events?.length ?? 0) => {
    let entry = stepToChange[step];
    while (entry) {
      if (entry.id === id) return entry.pId;
      entry = entry.prev;
    }
  };
  const getPath = (step: number) => {
    const path = [step];
    let current: A | undefined = { ...(trace.events ?? [])[step], step };
    while (current) {
      const pId = getParent(current.id, current.step);
      if (pId) {
        const event = findLast(r[pId], (c) => c.step <= current!.step);
        if (event) {
          path.push(event.step);
          current = event;
        } else break;
      } else break;
    }
    return path;
  };
  return { getParent, getPath };
}

export type TraceLayerData = {
  trace?: UploadedTrace;
  onion?: "off" | "transparent" | "solid";
};

export type TraceLayer = Layer<TraceLayerData>;

export const traceLayerSource: LayerSource<"trace", TraceLayerData> = {
  key: "trace",
  inferName: (layer) => layer.source?.trace?.name ?? "Untitled Trace",
  editor: withProduce(({ value, produce }) => {
    return (
      <>
        <Option
          label="Trace"
          content={
            <TracePicker
              onChange={(v) => produce((d) => set(d, "source.trace", v))}
              value={value?.source?.trace}
            />
          }
        />
        <Option
          label="Onion Skinning"
          content={
            <FeaturePicker
              disabled
              showArrow
              value={value?.source?.onion ?? "off"}
              items={["off", "transparent", "solid"].map((c) => ({
                id: c,
                name: startCase(c),
              }))}
              onChange={(v) => produce((d) => set(d, "source.onion", v))}
            />
          }
        />
        <Heading label="Preview" />
        <Box sx={{ height: 240, mx: -2, mb: -2 }}>
          <TracePreview trace={value?.source?.trace?.content} />
        </Box>
      </>
    );
  }),
  renderer: ({ layer }) => {
    const { palette } = useTheme();
    const [{ step = 0 }] = usePlayback();
    const throttledStep = useThrottle(step, 1000 / 60);
    const { result } = useTraceMemo(
      {
        trace: layer?.source?.trace?.content,
        context: {
          color: colorsHex,
          themeAccent: palette.primary.main,
          themeTextPrimary: palette.text.primary,
          themeBackground: palette.background.paper,
        },
        view: "main",
      },
      [palette, layer?.source?.trace]
    );
    const path = use2DPath(layer, throttledStep);
    const steps = useMemo(
      () =>
        map(result?.stepsPersistent, (c) =>
          map(c, (d) => merge(d, { meta: { sourceLayer: layer?.key } }))
        ),
      [result?.stepsPersistent, layer]
    );
    const steps1 = useMemo(
      () =>
        map(result?.stepsTransient, (c) =>
          map(c, (d) => merge(d, { meta: { sourceLayer: layer?.key } }))
        ),
      [result?.stepsTransient, layer]
    );
    const steps2 = useMemo(
      () => [steps1[throttledStep] ?? []],
      [steps1, throttledStep]
    );
    return (
      <>
        <LazyNodeList step={throttledStep} nodes={steps} />
        <NodeList nodes={steps2} />
        {path}
      </>
    );
  },
  steps: ({ layer, children }) => {
    const { events } = useTraceContent(layer?.source?.trace?.content);
    return <>{children?.(events)}</>;
  },
  getSelectionInfo: ({ layer, event, children }) => {
    const [, setPlayback] = usePlayback();
    const menu = useMemo(() => {
      const events = layer?.source?.trace?.content?.events ?? [];
      const steps = chain(event?.info?.components)
        .filter((c) => c.meta?.sourceLayer === layer?.key)
        .map((c) => c.meta?.step)
        .filter(negate(isUndefined))
        .sort((a, b) => b - a)
        .value() as number[];
      if (steps.length && layer) {
        const step = last(steps)!;
        const event = events[step];
        if (event) {
          return {
            [layer.key]: {
              primary: inferLayerName(layer),
              items: {
                properties: {
                  index: -1,
                  primary: <PropertyList event={event} vertical />,
                },
                [`${event}`]: {
                  primary: `Go to Step ${step}`,
                  secondary: `${startCase(event.type)}`,
                  action: () => setPlayback({ step }),
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
  },
};
function use2DPath(layer?: TraceLayer, step: number = 0) {
  const { palette } = useTheme();
  const { getPath } = useMemo(
    () =>
      layer?.source?.trace?.content
        ? makePathIndex(layer.source.trace.content)
        : { getParent: constant(undefined), getPath: constant([]) },
    [layer?.source?.trace?.content]
  );
  const element = useMemo(() => {
    if (layer?.source?.trace?.content?.render?.path) {
      const { pivot = {}, scale = 1 } = layer.source.trace.content.render.path;

      const { x, y } = pivot;

      const pivotX = x ? parseString(x) : (c: Partial<TraceEvent>) => c.x;
      const pivotY = y ? parseString(y) : (c: Partial<TraceEvent>) => c.y;

      const events = map(
        getPath(step),
        (p) => layer?.source?.trace?.content?.events?.[p]
      );

      if (events.length) {
        const primitive = [
          {
            $: "rect",
            x: pivotX({ x: 0, y: 0, ...head(events) }) - (2 * scale) / 2,
            y: pivotY({ x: 0, y: 0, ...head(events) }) - (2 * scale) / 2,
            fill: getColorHex("destination"),
            width: 2 * scale,
            height: 2 * scale,
          },
          {
            $: "rect",
            x: pivotX({ x: 0, y: 0, ...last(events) }) - (2 * scale) / 2,
            y: pivotY({ x: 0, y: 0, ...last(events) }) - (2 * scale) / 2,
            fill: getColorHex("source"),
            width: 2 * scale,
            height: 2 * scale,
          },
          {
            $: "path",
            points: events.map((c) => ({
              x: pivotX({ x: 0, y: 0, ...c }),
              y: pivotY({ x: 0, y: 0, ...c }),
            })),
            fill: palette.primary.main,
            alpha: 1,
            lineWidth: 1 * scale,
          },
        ];
        return (
          <NodeList
            nodes={[
              map(primitive, (c) => ({
                component: c,
                meta: { source: "path" },
              })),
            ]}
          />
        );
      }
    }
    return <></>;
  }, [layer, step, palette, getPath]);
  return element;
}
