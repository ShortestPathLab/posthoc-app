import {
  AccountTreeOutlined,
  CenterFocusWeakOutlined,
  DataObjectOutlined,
  ModeStandbyOutlined,
  TimelineOutlined
} from "@mui-symbols-material/w400";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import {
  Box,
  Checkbox,
  Divider,
  ListItem,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuList,
  MenuProps,
  Stack,
  SxProps,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";
import { SigmaContainer, useLoadGraph, useSigma } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { PlaybackLayerData, useStep } from "components/app-bar/Playback";
import { Block } from "components/generic/Block";
import { IconButtonWithTooltip } from "components/generic/inputs/IconButtonWithTooltip";
import { Label } from "components/generic/Label";
import { LayerPicker } from "components/generic/LayerPicker";
import { Spinner } from "components/generic/Spinner";
import { useSurfaceAvailableCssSize } from "components/generic/surface/useSurfaceSize";
import { Placeholder } from "components/inspector/Placeholder";
import {
  PropertyDialog,
  PropertyList
} from "components/inspector/PropertyList";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { getColorHex } from "components/renderer/colors";
import { Graph, MultiDirectedGraph } from "graphology";
import {
  HighlightLayerData,
  highlightNodesOptions,
  useHighlightNodes
} from "hooks/useHighlight";
import { usePlaybackControls } from "hooks/usePlaybackState";
import { inferLayerName } from "layers/inferLayerName";
import { getController } from "layers/layerControllers";
import { TraceLayerData } from "layers/trace/TraceLayer";
import { entries, findLast, isEmpty, map, startCase } from "lodash-es";
import { Size } from "protocol";
import { Fragment, useEffect, useState } from "react";
import { useThrottle } from "react-use";
import AutoSize from "react-virtualized-auto-sizer";
import { slice } from "slices";
import { Layer, useLayerPicker, WithLayer } from "slices/layers";
import { equal } from "slices/selector";
import { UploadedTrace } from "slices/UIState";
import { PanelState } from "slices/view";
import { getShade, useAcrylic, usePaper } from "theme";
import { set } from "utils/set";
import { Switch } from "../../components/generic/inputs/Switch";
import { PageContentProps } from "../PageMeta";
import AxisOverlay from "./Axis";
import { GraphEvents } from "./GraphEvents";
import { divider, isDefined, TreeGraph } from "./TreeGraph";
import { useTreeLayout } from "./TreeLayoutWorker";
import { useGraphSettings } from "./useGraphSettings";
import { useSelection } from "./useSelection";
import { useTrackedProperty } from "./useTrackedProperty";

type TreePageContext = PanelState;

const layoutModes = {
  "directed-graph": {
    value: "directed-graph",
    name: "Directed Graph",
    description: "Show all edges",
    showAllEdges: true
  },
  tree: {
    value: "tree",
    name: "Tree",
    description: "Show only edges between each node and their final parents",
    showAllEdges: false
  },
  scatterplot: {
    value: "scatterplot",
    name: "Scatterplot",
    description: "Show only edges between each node and their final parents",
    showAllEdges: false
  }
};

const CLEAN_CHECKBOX_SX = {
  p: 0.5,
  '&:hover': {
    backgroundColor: 'transparent', // remove grey hover background
  },
  '&.Mui-focusVisible': {
    outline: 'none',                // remove focus ring
  },
  '& .MuiSvgIcon-root': {
    transition: 'none',             // remove icon hover animation
  },
};

export type TreeLayer = Layer<
  PlaybackLayerData & TraceLayerData & HighlightLayerData
>;

const isTreeLayer = (l: Layer<unknown>): l is TreeLayer =>
  !!getController(l)?.steps;

function TreeMenu({
  layer: key,
  selected,
  selection,
  ...props
}: {
  layer?: string;
  selected?: ReturnType<typeof useSelection>["selected"];
  selection?: ReturnType<typeof useSelection>["selection"];
} & MenuProps) {
  const theme = useTheme();
  const step = useStep(key) ?? 0;
  const { stepTo } = usePlaybackControls(key);
  const showHighlight = useHighlightNodes(key);
  return (
    <Menu keepMounted {...props}>
      <MenuList dense sx={{ p: 0 }}>
        <ListItem sx={{ py: 0 }}>
          <Typography component="div" color="text.secondary" variant="overline">
            Events at {selection?.node}
          </Typography>
        </ListItem>
        {map(selected?.events, (entry, _, es) => {
          const selected =
            findLast(es, (c) => c.step <= step)?.step === entry.step;
          return (
            <Stack direction="row">
              <Tooltip title={`Go to step ${entry.step}`} placement="left">
                <MenuItem
                  selected={selected}
                  sx={{
                    height: 32,
                    flex: 1,
                    borderLeft: `4px solid ${getColorHex(entry.event.type)}`
                  }}
                  onClick={() => {
                    // setMenuOpen(false);
                    stepTo(entry.step);
                  }}
                >
                  <Box sx={{ ml: -0.5, pr: 4 }}>
                    <Label
                      primary={startCase(entry.event.type)}
                      secondary={
                        isDefined(entry.event.pId)
                          ? `Step ${entry.step}, from ${entry.event.pId}`
                          : `Step ${entry.step}`
                      }
                    />
                  </Box>
                </MenuItem>
              </Tooltip>
              <Box sx={{ flex: 0 }}>
                <PropertyDialog
                  event={entry.event}
                  trigger={({ open }) => (
                    <Tooltip title="See all properties" placement="right">
                      <MenuItem
                        selected={selected}
                        onClick={(e) => {
                          open();
                          props?.onClose?.(e, "backdropClick");
                        }}
                        sx={{ pr: 0 }}
                      >
                        <ListItemIcon>
                          <DataObjectOutlined />
                        </ListItemIcon>
                      </MenuItem>
                    </Tooltip>
                  )}
                />
              </Box>
            </Stack>
          );
        })}
        {!!selected?.current && (
          <>
            <Divider sx={{ my: 1, mx: 2 }} />
            <ListItem sx={{ py: 0 }}>
              <Typography
                component="div"
                color="text.secondary"
                variant="overline"
              >
                Step {selected.current.step}
              </Typography>
            </ListItem>
            <Box px={2} py={1}>
              <PropertyList
                event={selected.current.event}
                vertical
                simple
                primitives
              />
            </Box>
          </>
        )}
        {!!selected?.current && (
          <>
            <ListItem sx={{ py: 0 }}>
              <Typography
                component="div"
                color="text.secondary"
                variant="overline"
              >
                Focus on
              </Typography>
            </ListItem>
            {map(highlightNodesOptions, (highlight) => {
              const highlightColor = getShade(
                highlight.color,
                theme.palette.mode,
                500,
                400
              );
              return (
                <Stack direction="row">
                  <Tooltip title={highlight.description} placement="left">
                    <WithLayer<TreeLayer> layer={key}>
                      {(l) => (
                        <MenuItem
                          selected={
                            l.source?.highlighting?.type === highlight.type &&
                            l.source?.highlighting?.step ===
                            selected?.current?.step
                          }
                          sx={{
                            height: 32,
                            flex: 1,
                            borderLeft: `4px solid ${highlightColor}`
                          }}
                          onClick={(e) => {
                            showHighlight[highlight.type](
                              selected!.current!.step!
                            );
                            props?.onClose?.(e, "backdropClick");
                          }}
                        >
                          <Box sx={{ ml: -0.5, pr: 4 }}>
                            <Label primary={startCase(highlight.type)} />
                          </Box>
                        </MenuItem>
                      )}
                    </WithLayer>
                  </Tooltip>
                </Stack>
              );
            })}
          </>
        )}
      </MenuList>
    </Menu>
  );
}

function useTreePageState(key?: string) {
  "use no memo";

  const one = slice.layers.one<TreeLayer>(key);
  const trace = one.use<UploadedTrace | undefined>(
    (l) => l?.source?.trace,
    equal("key")
  );
  const step = one.use((l) => l?.source?.step);
  return { step, trace };
}

const sanitizeMetricKey = (key: string) => key.replace(/\./g, "");

export function TreePage({ template: Page }: PageContentProps) {
  const theme = useTheme();

  // Scatterplot
  const [scatterplotMode, setScatterplotMode] = useState<boolean>(false);
  const [logAxis, setLogAxis] = useState<{ x: boolean; y: boolean }>({ x: false, y: false });
  const [formInput, setFormInput] = useState<{
    xMetric: string;
    yMetric: string;
  }>({ xMetric: "", yMetric: "" });

  // ─── Layer Data ──────────────────────────────────────────────────────

  const { key, setKey } = useLayerPicker(isTreeLayer);
  const one = slice.layers.one<TreeLayer>(key);
  const { trace, step } = useTreePageState(key);
  console.log("TRACE DATA:", trace);

  const processedData =
    buildScatterPlotData(
      trace?.content,
      formInput.xMetric as MetricType,
      formInput.yMetric as MetricType,
    );

  console.log(processedData, "data for scatterplot");


  const handleAxisChange =
    (axis: "xMetric" | "yMetric") =>
      (value: any) => {
        const raw = String(value ?? "");
        const sanitized = raw ? sanitizeMetricKey(raw) : "";

        console.log("Changing axis:", axis, "raw:", raw, "sanitized:", sanitized);

        setFormInput((prev) => ({
          ...prev,
          [axis]: sanitized,
        }));
      };

  // ─── Playback ────────────────────────────────────────────────────────

  const throttled = useThrottle(step ?? 0, 1000 / 24);

  // ─── Panel Data ──────────────────────────────────────────────────────

  const { controls, onChange, state, dragHandle } =
    useViewTreeContext<TreePageContext>();
  const size = useSurfaceAvailableCssSize();

  // ─── Options ─────────────────────────────────────────────────────────

  const [trackedProperty, setTrackedProperty, properties] = useTrackedProperty(
    trace?.key,
    trace?.content
  );

  // const [axisTracking, setAxisTracking] = useState<typeof properties | "">("");

  const { point, selected, selection, setSelection } = useSelection(
    throttled,
    trace?.content
  );

  const [mode, setMode] = useState<"tree" | "directed-graph">("tree");

  // ─────────────────────────────────────────────────────────────────────

  const [menuOpen, setMenuOpen] = useState(false);

  const { data: tree, isLoading: loading } = useTreeLayout({
    trace: trace?.content,
    mode,
    key: trace?.key
  });

  const graphSettings = useGraphSettings();

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>tree</Page.Key>
      <Page.Title>Tree</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Block sx={size}>
          {trace ? (
            loading ? (
              <Spinner message="Generating layout" />
            ) : scatterplotMode ? (
              <AutoSize>
                {(size: Size) => (
                  <SigmaContainer
                    style={{
                      ...size,
                      background: theme.palette.background.paper,
                    }}
                    graph={Graph}
                    settings={graphSettings}
                  >
                    <ScatterPlotGraph processedData={processedData} />
                    <AxisOverlay
                      processedData={processedData}
                      width={size.width}
                      height={size.height}
                    />
                  </SigmaContainer>
                )}
              </AutoSize>

            ) : tree?.length ? (
              <>
                <AutoSize>
                  {(size: Size) => (
                    <SigmaContainer
                      style={{
                        ...size,
                        background: theme.palette.background.paper
                      }}
                      graph={MultiDirectedGraph}
                      settings={graphSettings}
                    >
                      <TreeGraph
                        width={size.width}
                        height={size.height}
                        step={throttled}
                        tree={tree}
                        trace={trace?.content}
                        layer={key}
                        showAllEdges={layoutModes[mode].showAllEdges}
                        trackedProperty={trackedProperty}
                        onExit={() => {
                          const layer = one.get();
                          if (!isEmpty(layer?.source?.highlighting)) {
                            one.set((l) => set(l, "source.highlighting", {}));
                          }
                        }}
                      />
                      <GraphEvents
                        layerKey={key}
                        onSelection={(e) => {
                          setSelection(e);
                          setMenuOpen(true);
                        }}
                      />
                    </SigmaContainer>
                  )}
                </AutoSize>
                <TreeMenu
                  onClose={() => setMenuOpen(false)}
                  anchorReference="anchorPosition"
                  anchorPosition={{
                    left: point.x,
                    top: point.y
                  }}
                  transformOrigin={{
                    horizontal: "left",
                    vertical: "top"
                  }}
                  open={menuOpen}
                  layer={key}
                  selected={selected}
                  selection={selection}
                />
              </>
            ) : (
              <WithLayer<TreeLayer> layer={key}>
                {(l) => (
                  <Placeholder
                    icon={<AccountTreeOutlined />}
                    label="Graph"
                    secondary={`${inferLayerName(l)} is not a graph.`}
                  />
                )}
              </WithLayer>
            )
          ) : (
            <Placeholder
              icon={<AccountTreeOutlined />}
              label="Graph"
              secondary="When you load a trace that has tree-like data, you'll see it here as a decision tree."
            />
          )}
        </Block>
      </Page.Content>
      <Page.Options>
        <>
          <LayerPicker onChange={setKey} value={key} guard={isTreeLayer} />
          {divider}
          {map(
            [
              {
                icon: <ModeStandbyOutlined />,
                label: "Layout",
                value: mode,
                onChange: setMode,
                items: map(entries(layoutModes), ([k, v]) => ({
                  id: k,
                  ...v
                }))
              },
              {
                icon: <TimelineOutlined />,
                label: "Tracked Property",
                value: trackedProperty,
                onChange: setTrackedProperty,
                items: [
                  { id: "", name: "Off" },
                  ...map(entries(properties), ([k, v]) => ({
                    id: k,
                    name: `$${k}`,
                    description: v.type
                  }))
                ]
              },
              // {
              //   icon: <LineAxisOutlined />,
              //   label: "Axis Tracking",
              //   value: axisTracking,
              //   onChange: setAxisTracking,
              //   items: [
              //     { id: "", name: "Off" },
              //     ...map(properties, (k) => ({ id: k, name: `$.${k}` })),
              //   ],
              // },
              {
                icon: <ScatterPlotIcon />,
                label: "Scatterplot",
                value: scatterplotMode,
                onChange: setTrackedProperty,
                items: []
              }
            ],
            ({ icon, label, value, items, onChange }, i) => (
              <Fragment key={i}>
                {!!i && divider}
                {label !== "Scatterplot" && (
                  <FeaturePicker
                    icon={icon}
                    label={label}
                    value={value}
                    items={items}
                    /// @ts-expect-error poor type inference
                    onChange={onChange}
                    arrow
                  />
                )}

                {label === "Scatterplot" && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <ScatterPlotIcon />
                    <Switch
                      size="small"
                      checked={scatterplotMode}
                      onChange={(_, checked) => setScatterplotMode(checked)}
                    />
                  </Box>
                )}

                {label === "Scatterplot" && scatterplotMode && (
                  <Stack direction="row" spacing={2} >
                    <FeaturePicker
                      label={formInput.xMetric ? `X axis: $${formInput.xMetric}` : "X axis"}
                      value={formInput.xMetric}
                      items={[
                        { id: "", name: "Off" },
                        ...map(entries(properties), ([k, v]) => ({
                          id: k,
                          name: `$${k}`,
                          description: v.type,
                        }))
                      ]}
                      onChange={handleAxisChange("xMetric")}
                      arrow
                      itemOrientation="horizontal"
                    />

                    <FeaturePicker
                      label={formInput.yMetric ? `Y axis: $${formInput.yMetric}` : "Y axis"}
                      value={formInput.yMetric}
                      items={[
                        { id: "", name: "Off" },
                        ...map(entries(properties), ([k, v]) => ({
                          id: k,
                          name: `$${k}`,
                          description: v.type,
                        }))
                      ]}
                      onChange={handleAxisChange("yMetric")}
                      arrow
                      itemOrientation="horizontal"
                    />
                  </Stack>
                )}

                {label === "Scatterplot" && scatterplotMode && (
                  <Stack direction="row" spacing={2} alignItems="center">

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Checkbox
                        size="small"
                        checked={logAxis.x}
                        onChange={(e) =>
                          setLogAxis((prev) => ({ ...prev, x: e.target.checked }))
                        }
                        sx={CLEAN_CHECKBOX_SX}
                      />
                      <Typography variant="body2">Log X</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Checkbox
                        size="small"
                        checked={logAxis.y}
                        onChange={(e) =>
                          setLogAxis((prev) => ({ ...prev, y: e.target.checked }))
                        }
                        sx={CLEAN_CHECKBOX_SX}
                      />
                      <Typography variant="body2">Log Y</Typography>
                    </Stack>

                  </Stack>
                )}
              </Fragment>
            )
          )}
        </>
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
type MetricsBag = {
  [key: string]: number;
};

type ScatterPlot = {
  id: string;
  label: string;
  step: number;
  eventType: string;
  metrics: MetricsBag;
};

type MetricType = keyof MetricsBag;

export type ScatterPlotOutput = {
  x: number;
  y: number;
  point: ScatterPlot;
};

export type ScatterPlotScaleAndData = {
  data: ScatterPlotOutput[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xAxis?: string;
  yAxis?: string;
};


const buildScatterPlotData = (
  traceData,
  xMetricName: MetricType,
  yMetricName: MetricType,
): ScatterPlotScaleAndData => {
  const scatterPlotData: ScatterPlotOutput[] = [];
  console.log("xMetricName:", xMetricName, "yMetricName:", yMetricName);
  console.log("traceData:", traceData);
  if (!traceData || !traceData.events) {
    return {
      data: [],
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0
    };
  }
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  console.log("Processing trace data for scatterplot...", traceData);
  traceData.events.forEach((event, step) => {
    const metrics: MetricsBag = {};
    for (const key in event) {
      const num = Number(event[key]);
      if (!isNaN(num) && key !== "id" && key !== "pId") {
        metrics[key] = num;
      }
    }
    metrics.step = step;
    const x = metrics[xMetricName] ?? 0;
    const y = metrics[yMetricName] ?? 0;

    xMin = Math.min(xMin, x);
    xMax = Math.max(xMax, x);
    yMin = Math.min(yMin, y);
    yMax = Math.max(yMax, y);

    scatterPlotData.push({
      x,
      y,
      point: {
        id: event.id,
        label: event.id,
        step,
        eventType: event.type,
        metrics
      }
    });
  });

  return { data: scatterPlotData, xMin, xMax: !isNaN(xMax) ? xMax + 1 : xMax, yMin, yMax: !isNaN(yMax) ? yMax + 1 : yMax };
};

export type ScatterPlotGraphProps = {
  processedData: ScatterPlotScaleAndData;
  width?: number;
  height?: number;
};

function ScatterPlotGraph({ processedData }: ScatterPlotGraphProps) {
  const sigma = useSigma();
  const acrylic = useAcrylic();

  const paper = usePaper();
  const loadGraph = useLoadGraph();
  console.log("ScatterPlotGraph rendered with data:", processedData);

  useEffect(() => {
    const graph = new Graph();

    const allPoints = processedData.data;
    if (!allPoints.length) {
      return;
    }

    const points = allPoints


    points.forEach((p, idx) => {
      const id = p.point.id ?? `scatter-${idx}`;
      if (!graph.hasNode(id)) {
        graph.addNode(id, {
          x: p.x,
          y: p.y,
          size: 3,
          label: p.point.label,
          color: "#ff6384",
        });
      }
    });
    loadGraph(graph);
  }, [processedData]);

  if (!processedData) {
    // This will appear on top of the canvas area
    return (
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No scatterplot data for the selected metrics.
        </Typography>
      </Box>
    );
  }


  return <Stack sx={{
    position: "absolute",
    top: 0,
    left: 0,
    pt: 6,
  }}>
    <Stack
      direction="row"
      sx={
        {
          ...paper(1),
          ...acrylic,
          alignItems: "center",
          px: 1,
          m: 1,
        } as SxProps<Theme>
      }
    >
      <IconButtonWithTooltip
        color="primary"
        onClick={() => {
          sigma?.getCamera?.()?.animatedReset?.();
        }}
        label="Fit"
        icon={<CenterFocusWeakOutlined />}
      />
    </Stack>
  </Stack>;
}