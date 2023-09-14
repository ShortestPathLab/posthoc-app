import { useTheme } from "@mui/material";
import { useDebounce } from "@uidotdev/usehooks";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { TracePicker } from "components/app-bar/Input";
import { PropertyList } from "components/inspector/PropertyList";
import { useRendererInstance } from "components/inspector/TraceRenderer";
import {
  LazyNodeList,
  NodeList,
} from "components/render/renderer/generic/NodeList";
import { colorsHex, getColorHex } from "components/renderer/colors";
import { parseString } from "components/renderer/parser/parseString";
import { useTraceMemo } from "components/renderer/parser/parseTrace";
import {
  Dictionary,
  chain,
  head,
  isUndefined,
  last,
  map,
  negate,
  pick,
  reduce,
  set,
  startCase,
} from "lodash";
import memoize from "memoizee";
import { withProduce } from "produce";
import { TraceEvent } from "protocol";
import { useMemo } from "react";
import { useThrottle } from "react-use";
import { Layer, UploadedTrace } from "slices/UIState";
import { usePlayback } from "slices/playback";
import { useTraceContent } from "../../../hooks/useTraceContent";
import { LayerSource, inferLayerName } from "./LayerSource";
import { Option } from "./Option";
import { ArrowOutwardRounded } from "@mui/icons-material";

type Key = string | number | null | undefined;

type Entry = { parent: Key; step: number };

function getPaths(events: TraceEvent[] = []) {
  const getCache = memoize((step: number) => {
    if (step) {
      const parent: Dictionary<Entry> = getCache(step - 1);
      const current = events[step];

      return current
        ? { ...parent, [current.id]: { parent: current.pId, step } }
        : parent;
    } else {
      return {};
    }
  });
  return (step: number) => {
    const cache = getCache(step);
    const path: number[] = [];
    const e = events[step];
    if (e) {
      let current: Key = e.id;
      while (current !== null && current !== undefined) {
        const currentCache: Entry = cache[current];
        if (currentCache) {
          path.push(currentCache?.step);
        }
        current = currentCache?.parent;
      }
    }
    return path;
  };
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
      </>
    );
  }),
  renderer: ({ layer }) => {
    const { palette } = useTheme();
    const [{ step = 0 }] = usePlayback();
    const throttledStep = useThrottle(step, 1000 / 24);
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
      [palette, layer]
    );
    const path = use2DPath(layer, throttledStep);
    return (
      <>
        <LazyNodeList step={throttledStep} nodes={result?.steps} />
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
                  primary: (
                    <PropertyList
                      event={pick(event, ["id", "f", "g", "pId"])}
                      vertical
                    />
                  ),
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
function use2DPath(layer?: TraceLayer, step: number = 0, ms: number = 300) {
  const debouncedStep = useDebounce(step, ms);
  const { renderer } = useRendererInstance();
  const { palette } = useTheme();
  const getPath = useMemo(
    () => getPaths(layer?.source?.trace?.content?.events),
    [layer]
  );
  const element = useMemo(() => {
    if (renderer && layer?.source?.trace?.content?.render?.path) {
      const { pivot = {}, scale = 1 } = layer.source.trace.content.render.path;

      const { x, y } = pivot;

      const pivotX = x ? parseString(x) : (c: Partial<TraceEvent>) => c.x;
      const pivotY = y ? parseString(y) : (c: Partial<TraceEvent>) => c.y;

      const events = map(
        getPath(debouncedStep),
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
  }, [layer, debouncedStep, palette, getPath, renderer]);
  return element;
}
