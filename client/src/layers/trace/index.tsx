import { ArrowOutwardRounded } from "@mui/icons-material";
import { Box, useTheme } from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { TracePicker } from "components/app-bar/Input";
import {
  PlaybackLayerData,
  PlaybackService,
} from "components/app-bar/Playback";
import { PropertyList } from "components/inspector/PropertyList";
import { Heading, Option } from "components/layer-editor/Option";
import { TracePreview } from "components/layer-editor/TracePreview";
import { LazyNodeList, NodeList } from "components/renderer/NodeList";
import { colorsHex, getColorHex } from "components/renderer/colors";
import { parseString } from "components/renderer/parser/parseString";
import { useTraceParser } from "components/renderer/parser/parseTrace";
import { ParseTraceWorkerReturnType } from "components/renderer/parser/parseTraceSlave.worker";
import { DebugLayerData } from "hooks/useBreakpoints";
import { useEffectWhen } from "hooks/useEffectWhen";
import { useTraceContent } from "hooks/useTraceContent";
import { LayerController, inferLayerName } from "layers";
import {
  chain,
  constant,
  findLast,
  forEach,
  head,
  isUndefined,
  keyBy,
  last,
  map,
  merge,
  negate,
  set,
  startCase,
} from "lodash";
import { nanoid as id } from "nanoid";
import { produce, withProduce } from "produce";
import { Trace, TraceEvent } from "protocol";
import { useEffect, useMemo } from "react";
import { useThrottle } from "react-use";
import { UploadedTrace } from "slices/UIState";
import { Layer, useLayer } from "slices/layers";

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
  parsedTrace?: {
    components: ParseTraceWorkerReturnType;
    content: Trace;
  };
  onion?: "off" | "transparent" | "solid";
} & PlaybackLayerData &
  DebugLayerData;

export type TraceLayer = Layer<TraceLayerData>;

export const controller = {
  key: "trace",
  inferName: (layer) => layer.source?.trace?.name ?? "Untitled Trace",
  editor: withProduce(({ value, produce }) => {
    return (
      <>
        <Option
          label="Trace"
          content={
            <TracePicker
              onChange={(v) =>
                produce((d) => set(d, "source.trace", { ...v, key: id() }))
              }
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
  service: withProduce(({ value, produce }) => {
    const { palette } = useTheme();
    const { result: trace } = useTraceContent(value?.source?.trace);
    const parseTrace = useTraceParser({
      trace: trace?.content,
      context: {
        color: colorsHex,
        themeAccent: palette.primary.main,
        themeTextPrimary: palette.text.primary,
        themeBackground: palette.background.paper,
      },
      view: "main",
    });
    useEffect(() => {
      produce((l) =>
        set(l, "source.playbackTo", trace?.content?.events?.length ?? 0)
      );
    }, [trace?.content?.events?.length]);
    useEffectWhen(
      async () => {
        const parsedTrace = await parseTrace();
        produce((l) => {
          set(l, "source.parsedTrace", parsedTrace);
          set(l, "viewKey", id());
        });
      },
      [parseTrace],
      [trace?.key]
    );
    return (
      <>
        <PlaybackService value={value} />
      </>
    );
  }),
  renderer: ({ layer, index }) => {
    const parsedTrace = layer?.source?.parsedTrace?.components;
    const step = useThrottle(layer?.source?.step ?? 0, 1000 / 60);

    const path = use2DPath(layer, index, step);
    const steps = useMemo(
      () =>
        map(parsedTrace?.stepsPersistent, (c) =>
          map(c, (d) =>
            merge(d, {
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
            merge(d, {
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
    const steps2 = useMemo(() => [steps1[step] ?? []], [steps1, step]);
    return (
      <>
        <LazyNodeList step={step} nodes={steps} />
        <NodeList nodes={steps2} />
        {path}
      </>
    );
  },
  steps: ({ layer, children }) => {
    return <>{children?.(layer?.source?.parsedTrace?.content?.events ?? [])}</>;
  },
  getSelectionInfo: ({ layer: key, event, children }) => {
    const { layer, setLayer } = useLayer(key);
    const menu = useMemo(() => {
      const events = layer?.source?.trace?.content?.events ?? [];
      const steps = chain(event?.info?.components)
        .filter((c) => c.meta?.sourceLayer === layer?.key)
        .map((c) => c.meta?.step)
        .filter(negate(isUndefined))
        .sort((a, b) => a! - b!)
        .value() as number[];
      const info = chain(event?.info?.components)
        .filter((c) => c.meta?.sourceLayer === layer?.key)
        .filter((c) => c.meta?.info)
        .value() as any[];
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
                    primary: <PropertyList event={x.meta.info} vertical />,
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
                  primary: <PropertyList event={event} vertical />,
                },

                [`${event}`]: {
                  primary: `Go to Step ${step}`,
                  secondary: `${startCase(event.type)}`,
                  action: () =>
                    setLayer(
                      produce(layer, (l) => {
                        set(l, "source.step", step);
                      })
                    ),
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
} satisfies LayerController<"trace", TraceLayerData>;

function use2DPath(layer?: TraceLayer, index: number = 0, step: number = 0) {
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

      const pivotX = x ? parseString(x) : (c: Partial<TraceEvent>) => c.event.x;
      const pivotY = y ? parseString(y) : (c: Partial<TraceEvent>) => c.event.y;

      const events = map(
        getPath(step),
        (p) => layer?.source?.trace?.content?.events?.[p]
      );

      if (events.length) {
        const primitive = [
          {
            $: "rect",
            x:
              pivotX({ event: { x: 0, y: 0, ...head(events) } }) -
              (2 * scale) / 2,
            y:
              pivotY({ event: { x: 0, y: 0, ...head(events) } }) -
              (2 * scale) / 2,
            fill: getColorHex("destination"),
            width: 2 * scale,
            height: 2 * scale,
          },
          {
            $: "rect",
            x:
              pivotX({ event: { x: 0, y: 0, ...last(events) } }) -
              (2 * scale) / 2,
            y:
              pivotY({ event: { x: 0, y: 0, ...last(events) } }) -
              (2 * scale) / 2,
            fill: getColorHex("source"),
            width: 2 * scale,
            height: 2 * scale,
          },
          {
            $: "path",
            points: events.map((c) => ({
              x: pivotX({ event: { x: 0, y: 0, ...c } }),
              y: pivotY({ event: { x: 0, y: 0, ...c } }),
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
                meta: { source: "path", sourceLayerIndex: -99999 + index },
              })),
            ]}
          />
        );
      }
    }
    return <></>;
  }, [layer, index, step, palette, getPath]);
  return element;
}
