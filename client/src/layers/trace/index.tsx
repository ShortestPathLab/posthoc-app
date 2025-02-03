import {
  ArrowOutwardRounded,
  DataObjectOutlined,
  RouteOutlined,
} from "@mui-symbols-material/w400";
import {
  Box,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
  useTheme,
} from "@mui/material";
import { TracePicker } from "components/app-bar/Input";
import {
  PlaybackLayerData,
  PlaybackService,
} from "components/app-bar/Playback";
import {
  custom,
  isTraceFormat,
  readUploadedTrace,
} from "components/app-bar/upload";
import Editor from "components/generic/list-editor/ListEditor";
import {
  PropertyDialog,
  PropertyList,
} from "components/inspector/PropertyList";
import { useUntrustedLayers } from "components/inspector/useUntrustedLayers";
import { Heading, Option } from "components/layer-editor/Option";
import { TracePreview } from "components/layer-editor/TracePreview";
import { colorsHex } from "components/renderer/colors";
import { LazyNodeList, NodeList } from "components/renderer/NodeList";
import { useTraceParser } from "components/renderer/parser-v140/parseTrace";
import { ParseTraceWorkerReturnType } from "components/renderer/parser/ParseTraceSlaveWorker";
import { DebugLayerData } from "hooks/useBreakpoints";
import { useTraceContent } from "hooks/useTraceContent";
import { dump } from "js-yaml";
import { inferLayerName, LayerController } from "layers";
import {
  chain,
  get,
  isUndefined,
  keyBy,
  last,
  map,
  mapValues,
  merge,
  negate,
  pick,
  startCase,
} from "lodash";
import { nanoid } from "nanoid";
import { produce, withProduce } from "produce";
import { Trace as TraceLegacy } from "protocol";
import { Trace } from "protocol/Trace-v140";
import { useEffect, useMemo } from "react";
import { useAsync, useThrottle } from "react-use";
import { Layer, useLayer } from "slices/layers";
import { UploadedTrace } from "slices/UIState";
import { AccentColor, accentColors, getShade } from "theme";
import { name } from "utils/path";
import { set } from "utils/set";
import { parseYamlAsync } from "workers/async";
import { TrustedLayerData } from "../TrustedLayerData";
import { use2DPath } from "./use2DPath";
import { isTraceLayer } from "./isTraceLayer";

export type TraceLayerData = {
  trace?: UploadedTrace & { error?: string };
  parsedTrace?: {
    components?: ParseTraceWorkerReturnType;
    content?: Trace | TraceLegacy;
    error?: string;
  };
  onion?: "off" | "transparent" | "solid";
} & PlaybackLayerData &
  DebugLayerData &
  TrustedLayerData;

export type TraceLayer = Layer<TraceLayerData>;

export const controller = {
  key: "trace",
  icon: <RouteOutlined />,
  inferName: (layer) => layer.source?.trace?.name ?? "Untitled Trace",
  error: (layer) =>
    layer?.source?.trace?.error || layer?.source?.parsedTrace?.error,
  compress: (layer) =>
    pick(layer, ["trace", "onion", "step", "code", "breakpoints"]),
  claimImportedFile: async (file) =>
    isTraceFormat(file)
      ? {
          claimed: true,
          layer: async (notify) => {
            notify("Opening trace...");
            try {
              const output = readUploadedTrace(file);
              return { trace: await output.read() };
            } catch (e) {
              console.error(e);
              notify(`Error opening, ${get(e, "message")}`);
              return {
                trace: {
                  key: nanoid(),
                  id: custom().id,
                  error: get(e, "message"),
                  name: startCase(name(file.name)),
                },
              };
            }
          },
        }
      : { claimed: false },
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
        {value?.source?.trace?.error && (
          <Typography
            component="div"
            variant="body2"
            color="error"
            sx={{
              whiteSpace: "pre-wrap",
              mb: 1,
              mt: 1,
            }}
          >
            <code>{value?.source?.trace?.error}</code>
          </Typography>
        )}
        {value?.source?.parsedTrace?.error && (
          <Typography
            component="div"
            variant="body2"
            color="error"
            sx={{
              whiteSpace: "pre-wrap",
              mb: 1,
              mt: 1,
            }}
          >
            <code>{value?.source?.parsedTrace?.error}</code>
          </Typography>
        )}
        <Heading label="Preview" />
        <Box sx={{ height: 240, mx: -2 }}>
          <TracePreview trace={value?.source?.parsedTrace?.content} />
        </Box>
      </>
    );
  }),
  service: withProduce(({ value, produce }) => {
    const { palette } = useTheme();
    const { result: trace, loading } = useTraceContent(value?.source?.trace);
    // Set playback
    useEffect(() => {
      produce((l) => {
        return set(l, "source.playbackTo", trace?.content?.events?.length ?? 0);
      });
    }, [trace?.key]);
    const { isTrusted } = useUntrustedLayers();
    // Make the trace parser
    const parseTrace = useTraceParser(
      {
        trace: trace?.content,
        context: {
          theme: {
            foreground: palette.text.primary,
            background: palette.background.paper,
            accent: palette.primary.main,
          },
          color: {
            ...colorsHex,
            ...mapValues(accentColors, (_, v: AccentColor) =>
              getShade(v, palette.mode, 500, 400)
            ),
          },
          themeAccent: palette.primary.main,
          themeTextPrimary: palette.text.primary,
          themeBackground: palette.background.paper,
        },
        view: "main",
      },
      isTrusted,
      [trace?.key, palette.mode, isTrusted]
    );
    // Parse the trace
    useAsync(async () => {
      if (parseTrace && !loading) {
        const parsedTrace = await parseTrace();
        produce((l) => {
          set(l, "source.parsedTrace", parsedTrace);
          set(l, "viewKey", nanoid());
        });
      }
    }, [loading, parseTrace]);
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
    const persistentSteps = useMemo(
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
    const transientSteps = useMemo(() => [steps1[step] ?? []], [steps1, step]);
    return (
      <>
        <LazyNodeList end={step} nodes={persistentSteps} />
        <NodeList nodes={transientSteps} />
        {path}
      </>
    );
  },
  steps: (layer) => layer?.source?.parsedTrace?.content?.events ?? [],
  provideSelectionInfo: ({ layer: key, event, children }) => {
    const { layer, setLayer } = useLayer(key, isTraceLayer);
    const menu = useMemo(() => {
      const events = layer?.source?.parsedTrace?.content?.events ?? [];
      const steps = chain(event?.info?.components)
        .filter((c) => c.meta?.sourceLayer === layer?.key)
        .map((c) => c.meta?.step)
        .filter(negate(isUndefined))
        .sort((a, b) => a! - b!)
        .value() as number[];
      const info = chain(event?.info?.components)
        .filter((c) => c.meta?.sourceLayer === layer?.key)
        .filter((c) => c.meta?.info)
        .value();
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

  getSources: (layer) => {
    const trace = layer?.source?.trace;
    if (trace) {
      return [
        {
          id: "trace",
          name: `${trace.name}`,
          language: "yaml",
          content: dump(trace.content, { noCompatMode: true }),
          editor: Editor,
        },
      ];
    } else return [];
  },
  onEditSource: async (layer, id, content) => {
    try {
      if (id !== "trace") throw { error: "id not trace", id };
      if (!content) throw { error: "content is undefined", layer, content };

      const updatedLayerSource = (await parseYamlAsync(content)) as Trace;
      // Set the trace content
      set(layer, "source.trace.content", updatedLayerSource);
      // To get things to change, we also need to change the trace key
      set(layer, "source.trace.key", nanoid());
      console.log(layer);
    } catch (error) {
      console.error(error);
    }
    return layer;
  },
} satisfies LayerController<"trace", TraceLayerData>;
