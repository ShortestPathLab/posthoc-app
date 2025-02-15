import {
  AccountTreeOutlined,
  DataObjectOutlined,
  ModeStandbyOutlined,
  TimelineOutlined,
} from "@mui-symbols-material/w400";
import {
  Box,
  CircularProgress,
  Divider,
  ListItem,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuList,
  MenuProps,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { SigmaContainer } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { PlaybackLayerData, useStep } from "components/app-bar/Playback";
import { Block } from "components/generic/Block";
import { Label } from "components/generic/Label";
import { LayerPicker } from "components/generic/LayerPicker";
import { useSurfaceAvailableCssSize } from "components/generic/surface/useSurfaceSize";
import { Placeholder } from "components/inspector/Placeholder";
import {
  PropertyDialog,
  PropertyList,
} from "components/inspector/PropertyList";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { getColorHex } from "components/renderer/colors";
import { MultiDirectedGraph } from "graphology";
import {
  HighlightLayerData,
  highlightNodesOptions,
  useHighlightNodes,
} from "hooks/useHighlight";
import { usePlaybackControls } from "hooks/usePlaybackState";
import { inferLayerName } from "layers/inferLayerName";
import { getController } from "layers/layerControllers";
import { TraceLayerData } from "layers/TraceLayer";
import { entries, findLast, isEmpty, map, startCase } from "lodash";
import { Size } from "protocol";
import { Fragment, useState } from "react";
import { useThrottle } from "react-use";
import AutoSize from "react-virtualized-auto-sizer";
import { slice } from "slices";
import { Layer, useLayerPicker, WithLayer } from "slices/layers";
import { PanelState } from "slices/view";
import { getShade } from "theme";
import { set } from "utils/set";
import { PageContentProps } from "../PageMeta";
import { GraphEvents } from "./GraphEvents";
import { divider, isDefined, TreeGraph } from "./TreeGraph";
import { useTreeLayout } from "./TreeLayoutWorker";
import { useGraphSettings } from "./useGraphSettings";
import { useSelection } from "./useSelection";
import { useTrackedProperty } from "./useTrackedProperty";
import { equal } from "slices/selector";
import { UploadedTrace } from "slices/UIState";

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
                    borderLeft: `4px solid ${getColorHex(entry.event.type)}`,
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
                            borderLeft: `4px solid ${highlightColor}`,
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

export function TreePage({ template: Page }: PageContentProps) {
  const theme = useTheme();

  // ─── Layer Data ──────────────────────────────────────────────────────

  const { key, setKey } = useLayerPicker(isTreeLayer);
  const one = slice.layers.one<TreeLayer>(key);
  const { trace, step } = useTreePageState(key);

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
              <Block
                sx={{
                  flexDirection: "column",
                  gap: 4,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
                <Typography
                  component="div"
                  variant="body2"
                  sx={{ px: 8, maxWidth: 480 }}
                >
                  Generating layout
                </Typography>
              </Block>
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
            )
          )}
        </>
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
