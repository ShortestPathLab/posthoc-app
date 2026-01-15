import { CenterFocusWeakOutlined } from "@mui-symbols-material/w300";
import {
  AccountTreeOutlined,
  DataObjectOutlined,
  ModeStandbyOutlined,
  TimelineOutlined,
} from "@mui-symbols-material/w400";
import {
  Box,
  Divider,
  ListItem,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuList,
  MenuProps,
  Stack,
  SxProps,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { SigmaContainer, useSigma } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { useStep } from "components/app-bar/Playback";
import { Block } from "components/generic/Block";
import { IconButtonWithTooltip } from "components/generic/inputs/IconButtonWithTooltip";
import { Label } from "components/generic/Label";
import { LayerPicker } from "components/generic/LayerPicker";
import { Spinner } from "components/generic/Spinner";
import { useSurfaceAvailableCssSize } from "components/generic/surface/useSurfaceSize";
import { Placeholder } from "components/inspector/Placeholder";
import { PropertyDialog } from "components/inspector/PropertyList";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { getColorHex } from "components/renderer/colors";
import { MultiDirectedGraph } from "graphology";
import { highlightNodesOptions, useHighlightNodes } from "hooks/useHighlight";
import { usePlaybackControls } from "hooks/usePlaybackState";
import { inferLayerName } from "layers/inferLayerName";
import { entries, findLast, isEmpty, map, startCase } from "lodash-es";
import { Size } from "protocol";
import { Fragment, useMemo, useState } from "react";
import { useThrottle } from "react-use";
import AutoSize from "react-virtualized-auto-sizer";
import { slice } from "slices";
import { useLayerPicker, WithLayer } from "slices/layers";
import { PanelState } from "slices/view";
import { getShade, useAcrylic, usePaper } from "theme";
import { set } from "utils/set";
import { PageContentProps } from "../PageMeta";
import AxisOverlay from "./Axis";
import { buildScatterPlotData } from "./buildScatterPlotData";
import { GraphEvents } from "./GraphEvents";
import { ScatterPlotControls } from "./ScatterPlotControls";
import { ScatterPlotGraph } from "./ScatterPlotGraph";
import { divider, isDefined, TreeGraph } from "./TreeGraph";
import { isTreeLayer, TreeLayer } from "./TreeLayer";
import { useTreeLayout } from "./TreeLayoutWorker";
import { useGraphSettings } from "./useGraphSettings";
import { useSelection } from "./useSelection";
import { useTrackedProperty } from "./useTrackedProperty";
import { useTreePageState } from "./useTreePageState";

type TreePageContext = PanelState;

const layoutModes = {
  "directed-graph": {
    value: "directed-graph",
    name: "Directed Graph",
    description: "Show all edges",
    showAllEdges: true,
  },
  tree: {
    value: "tree",
    name: "Tree",
    description: "Show only edges between each node and their final parents",
    showAllEdges: false,
  },
};
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

  const MENU_WIDTH = 360;
  const MENU_MAX_HEIGHT = "min(70vh, 520px)";
  const stop = (e: any) => e.stopPropagation();

  const isIdLabel = (k: string) => k.toLowerCase().includes("id");

  const formatValue = (v: unknown) => {
    if (v === null || v === undefined) return "";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };

  const Row = ({ k, v }: { k: string; v: unknown }) => (
    <Stack direction="row" spacing={1} sx={{ py: 0.25, overflowX: "hidden" }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 80, flexShrink: 0 }}
      >
        {k}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {formatValue(v)}
      </Typography>
    </Stack>
  );

  return (
    <Menu
      keepMounted
      {...props}
      PaperProps={{
        sx: {
          width: MENU_WIDTH,
          maxHeight: MENU_MAX_HEIGHT,
          overflow: "hidden",
        },
        onWheel: stop,
        onMouseDown: stop,
        onClick: stop,
        onTouchMove: stop,
      }}
    >
      <MenuList
        dense
        sx={{
          p: 0,
          maxHeight: MENU_MAX_HEIGHT,
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
        }}
        onWheel={stop}
        onTouchMove={stop}
      >
        <ListItem sx={{ py: 0 }}>
          <Typography component="div" color="text.secondary" variant="overline">
            Events at {selection?.node}
          </Typography>
        </ListItem>

        {map(selected?.events, (entry, _, es) => {
          const isSelected =
            findLast(es, (c) => c.step <= step)?.step === entry.step;

          return (
            <Stack
              key={entry.step}
              direction="row"
              sx={{ overflowX: "hidden" }}
            >
              <Tooltip title={`Go to step ${entry.step}`} placement="left">
                <MenuItem
                  selected={isSelected}
                  sx={{
                    height: 32,
                    flex: 1,
                    minWidth: 0,
                    borderLeft: `4px solid ${getColorHex(entry.event.type)}`,
                  }}
                  onClick={() => stepTo(entry.step)}
                >
                  <Box sx={{ ml: -0.5, pr: 2, overflow: "hidden" }}>
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
                        selected={isSelected}
                        onClick={(e) => {
                          open();
                          props?.onClose?.(e, "backdropClick");
                        }}
                        sx={{ pr: 0, flexShrink: 0 }}
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

            {(() => {
              const event = selected.current!.event as Record<string, unknown>;
              const type = String(event?.type ?? "");

              // ID props first in order
              const idProps = Object.entries(event).filter(
                ([k]) => k !== "type" && isIdLabel(k),
              );

              const otherProps = Object.entries(event).filter(
                ([k]) => k !== "type" && !isIdLabel(k),
              );

              return (
                <>
                  {/* Type of event */}
                  <ListItem sx={{ py: 0 }}>
                    <Typography
                      component="div"
                      color="text.secondary"
                      variant="overline"
                    >
                      Type of event
                    </Typography>
                  </ListItem>

                  <Box px={2} pb={1}>
                    <Typography variant="body2">{startCase(type)}</Typography>
                  </Box>

                  {!!idProps.length && (
                    <Box px={2} pb={1}>
                      {idProps.map(([k, v]) => (
                        <Row key={k} k={k} v={v} />
                      ))}
                    </Box>
                  )}

                  <ListItem sx={{ py: 0 }}>
                    <Typography
                      component="div"
                      color="text.secondary"
                      variant="overline"
                    >
                      Other properties
                    </Typography>
                  </ListItem>

                  <Box px={2} py={1}>
                    {otherProps.length ? (
                      otherProps.map(([k, v]) => <Row key={k} k={k} v={v} />)
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        None
                      </Typography>
                    )}
                  </Box>
                </>
              );
            })()}
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
                400,
              );

              return (
                <Stack key={highlight.type} direction="row">
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
                            minWidth: 0,
                            borderLeft: `4px solid ${highlightColor}`,
                          }}
                          onClick={(e) => {
                            showHighlight[highlight.type](
                              selected!.current!.step!,
                            );
                            props?.onClose?.(e, "backdropClick");
                          }}
                        >
                          <Box sx={{ ml: -0.5, pr: 2, overflow: "hidden" }}>
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

const sanitizeMetricKey = (key: string) => key.replace(/\./g, "");

export function TreePage({ template: Page }: PageContentProps) {
  const theme = useTheme();

  // Scatterplot
  const [logAxis, setLogAxis] = useState<{ x: boolean; y: boolean }>({
    x: false,
    y: false,
  });
  const [formInput, setFormInput] = useState<{
    xMetric: string;
    yMetric: string;
  }>({ xMetric: "", yMetric: "" });

  const [eventTypeFilter, setEventTypeFilter] = useState<string>("");

  // Scatterplot is ON only if both axes are selected
  const scatterplotMode = Boolean(formInput.xMetric && formInput.yMetric);

  // ─── Layer Data ──────────────────────────────────────────────────────

  const { key, setKey } = useLayerPicker(isTreeLayer);
  const one = slice.layers.one<TreeLayer>(key);
  const { trace, step } = useTreePageState(key);

  const processedData = useMemo(
    () =>
      buildScatterPlotData(
        trace?.content,
        formInput.xMetric,
        formInput.yMetric,
      ),
    [trace?.content, formInput.xMetric, formInput.yMetric],
  );

  const eventTypes = Array.from(
    new Set(processedData.data.map((p) => p.point.eventType)),
  );

  const handleEventTypeChange = (value: any) => {
    const v = String(value ?? "");
    setEventTypeFilter(v);
  };
  const handleAxisChange = (axis: "xMetric" | "yMetric") => (value: any) => {
    const raw = String(value ?? "");
    const sanitized = raw ? sanitizeMetricKey(raw) : "";

    if (!sanitized) {
      setFormInput({
        xMetric: "",
        yMetric: "",
      });
      return;
    }

    setFormInput((prev) => ({
      ...prev,
      [axis]: sanitized,
    }));
  };

  const [groupByAttribute, setGroupByAttribute] = useState<string>("");

  const handleGroupByChange = (newValue: string) => {
    setGroupByAttribute(newValue);
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
    trace?.content,
  );

  const { point, selected, selection, setSelection } = useSelection(
    throttled,
    trace?.content,
  );

  const [mode, setMode] = useState<"tree" | "directed-graph">("tree");

  // ─────────────────────────────────────────────────────────────────────

  const [menuOpen, setMenuOpen] = useState(false);
  const [axisBounds, setAxisBounds] = useState<AxisBounds | null>(null);

  const stableAxisBounds = useMemo(
    () => axisBounds,
    [axisBounds?.xMin, axisBounds?.xMax, axisBounds?.yMin, axisBounds?.yMax],
  );

  const { data: tree, isLoading: loading } = useTreeLayout({
    trace: trace?.content,
    mode,
    key: trace?.key,
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
            ) : tree?.length ? (
              <>
                <AutoSize>
                  {(size: Size) => (
                    <SigmaContainer
                      style={{
                        ...size,
                        background: theme.palette.background.paper,
                      }}
                      graph={MultiDirectedGraph}
                      settings={graphSettings}
                    >
                      {!scatterplotMode && (
                        <>
                          {" "}
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
                                one.set((l) =>
                                  set(l, "source.highlighting", {}),
                                );
                              }
                            }}
                          />
                        </>
                      )}
                      {scatterplotMode && (
                        <>
                          <ScatterPlotOverlayToolbar />
                          <ScatterPlotGraph
                            processedData={processedData}
                            logAxis={logAxis}
                            eventTypeFilter={eventTypeFilter}
                            step={throttled}
                            axisBounds={stableAxisBounds}
                          />
                          <AxisOverlay
                            processedData={processedData}
                            width={size.width}
                            height={size.height}
                            logAxis={logAxis}
                            onBoundsChange={setAxisBounds}
                          />
                        </>
                      )}

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
                {menuOpen && (
                  <TreeMenu
                    onClose={() => setMenuOpen(false)}
                    anchorReference="anchorPosition"
                    anchorPosition={{
                      left: point.x,
                      top: point.y,
                    }}
                    transformOrigin={{
                      horizontal: "left",
                      vertical: "top",
                    }}
                    open={menuOpen}
                    layer={key}
                    selected={selected}
                    selection={selection}
                  />
                )}
                <ScatterPlotControls
                  eventTypes={eventTypes}
                  scatterplotMode={scatterplotMode}
                  handleAxisChange={handleAxisChange}
                  handleEventTypeChange={handleEventTypeChange}
                  handleGroupByChange={handleGroupByChange}
                  formInput={formInput}
                  groupByAttribute={groupByAttribute}
                  eventTypeFilter={eventTypeFilter}
                  logAxis={logAxis}
                  properties={properties}
                  setLogAxis={setLogAxis}
                />
              </>
            ) : (
              <>
                <WithLayer<TreeLayer> layer={key}>
                  {(l) => (
                    <Placeholder
                      icon={<AccountTreeOutlined />}
                      label="Graph"
                      secondary={`${inferLayerName(l)} is not a graph.`}
                    />
                  )}
                </WithLayer>
              </>
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
                  ...v,
                })),
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
                    description: v.type,
                  })),
                ],
              },
            ],
            ({ icon, label, value, items, onChange }, i) => (
              <Fragment key={i}>
                {!!i && divider}
                <FeaturePicker
                  icon={icon}
                  label={label}
                  value={value}
                  items={items}
                  /// @ts-expect-error poor type inference
                  onChange={onChange}
                  arrow
                />
              </Fragment>
            ),
          )}

          {divider}
        </>
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}

export type ScatterPlotGraphProps = {
  processedData: ScatterPlotScaleAndData;
  logAxis: { x: boolean; y: boolean };
  eventTypeFilter?: string;
  step?: number;
  axisBounds?: AxisBounds | null;
};

export function ScatterPlotOverlayToolbar() {
  const sigma = useSigma();
  const paper = usePaper();
  const acrylic = useAcrylic();

  return (
    <Stack
      sx={{
        pt: 6,
        transition: (t) => t.transitions.create("padding-top"),
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <Stack
        direction="row"
        sx={
          {
            ...paper(1),
            ...acrylic,
            alignItems: "center",
            height: (t) => t.spacing(6),
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
    </Stack>
  );
}

export type MetricsBag = {
  [key: string]: number;
};

type ScatterPlot = {
  id: string; // unique id for sigma
  logicalId: string; // original id for this to work with selection code
  label: string;
  step: number;
  eventType: string;
  metrics: MetricsBag;
};

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

export type AxisBounds = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};
