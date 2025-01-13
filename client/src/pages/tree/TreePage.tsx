import {
  AccountTreeOutlined,
  DataObjectOutlined,
  LayersOutlined as LayersIcon,
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
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { SigmaContainer } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { EdgeCurvedArrowProgram } from "@sigma/edge-curve";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { PlaybackLayerData } from "components/app-bar/Playback";
import { Flex } from "components/generic/Flex";
import { Label } from "components/generic/Label";
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
import { usePlaybackState } from "hooks/usePlaybackState";
import { inferLayerName } from "layers/inferLayerName";
import { getController } from "layers/layerControllers";
import { TraceLayerData } from "layers/trace";
import { entries, find, findLast, isEmpty, map, set, startCase } from "lodash";
import { produce } from "produce";
import { Size } from "protocol";
import { ComponentProps, useMemo, useState } from "react";
import { useThrottle } from "react-use";
import AutoSize from "react-virtualized-auto-sizer";
import { EdgeArrowProgram } from "sigma/rendering";
import { Layer, useLayer } from "slices/layers";
import { PanelState } from "slices/view";
import { getShade } from "theme";
import { PageContentProps } from "../PageMeta";
import { GraphEvents } from "./GraphEvents";
import { divider, isDefined, TreeGraph } from "./TreeGraph";
import { useTreeMemo } from "./TreeWorker";
import { useSelection } from "./useSelection";
import { useTrackedProperty } from "./useTrackedProperty";

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

const stepsLayerGuard = (
  l: Layer
): l is Layer<PlaybackLayerData & TraceLayerData & HighlightLayerData> =>
  !!getController(l).steps;

export function TreePage({ template: Page }: PageContentProps) {
  const theme = useTheme();

  // ─── Layer Data ──────────────────────────────────────────────────────

  const { key, setKey, setLayer, layer, layers, allLayers } = useLayer(
    undefined,
    stepsLayerGuard
  );
  const trace = layer?.source?.trace?.content;

  const step = useThrottle(layer?.source?.step ?? 0, 1000 / 24);
  const { stepTo } = usePlaybackState(key);

  // ─── Panel Data ──────────────────────────────────────────────────────

  const { controls, onChange, state, dragHandle } =
    useViewTreeContext<TreePageContext>();

  // ─── Options ─────────────────────────────────────────────────────────

  const [trackedProperty, setTrackedProperty, properties] =
    useTrackedProperty(trace);

  const { point, selected, selection, setSelection } = useSelection(
    step,
    trace
  );

  const [mode, setMode] = useState<"tree" | "directed-graph">("tree");

  // ─────────────────────────────────────────────────────────────────────

  const [menuOpen, setMenuOpen] = useState(false);

  const showHighlight = useHighlightNodes(key);

  const { result: tree, loading } = useTreeMemo({ trace, mode }, [key, mode]);

  const graphSettings = useMemo(
    () =>
      ({
        stagePadding: 8 * 8,
        allowInvalidContainer: true,
        edgeLabelColor: { color: theme.palette.text.secondary },
        labelFont: "Inter",
        labelSize: 14,
        labelDensity: 0.1,
        renderEdgeLabels: true,
        edgeLabelFont: "Inter",
        edgeLabelSize: 12,
        defaultDrawNodeHover: () => {},
        labelColor: { color: theme.palette.text.primary },
        edgeLabelWeight: "500",
        defaultEdgeType: "arrow",
        edgeProgramClasses: {
          straight: EdgeArrowProgram,
          curvedArrow: EdgeCurvedArrowProgram,
        },
      } as ComponentProps<typeof SigmaContainer>["settings"]),
    [theme]
  );

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>tree</Page.Key>
      <Page.Title>Tree</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Flex>
          {trace ? (
            !loading ? (
              tree?.length ? (
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
                          step={step}
                          tree={tree}
                          trace={trace}
                          layer={layer}
                          showAllEdges={layoutModes[mode].showAllEdges}
                          trackedProperty={trackedProperty}
                          highlightEdges={layer.source?.highlighting}
                          onExit={() => {
                            if (!isEmpty(layer?.source?.highlighting)) {
                              setLayer(
                                produce(layer, (l) =>
                                  set(l?.source!, "highlighting", {})
                                )!
                              );
                            }
                          }}
                        />
                        <GraphEvents
                          layer={key}
                          onSelection={(e) => {
                            setSelection(e);
                            setMenuOpen(true);
                          }}
                        />
                      </SigmaContainer>
                    )}
                  </AutoSize>
                  <Menu
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
                  >
                    <MenuList dense sx={{ p: 0 }}>
                      <ListItem sx={{ py: 0 }}>
                        <Typography
                          component="div"
                          color="text.secondary"
                          variant="overline"
                        >
                          Events at {selection?.node}
                        </Typography>
                      </ListItem>
                      {map(selected.events, (entry, _, es) => {
                        const selected =
                          findLast(es, (c) => c.step <= step)?.step ===
                          entry.step;
                        return (
                          <Stack direction="row">
                            <Tooltip
                              title={`Go to step ${entry.step}`}
                              placement="left"
                            >
                              <MenuItem
                                selected={selected}
                                sx={{
                                  height: 32,
                                  flex: 1,
                                  borderLeft: `4px solid ${getColorHex(
                                    entry.event.type
                                  )}`,
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
                                {...{ event: entry.event }}
                                trigger={(onClick) => (
                                  <Tooltip
                                    title="See all properties"
                                    placement="right"
                                  >
                                    <MenuItem
                                      selected={selected}
                                      {...{ onClick }}
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
                      {!!selected.current && (
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
                      {!!selected.current && (
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
                                <Tooltip
                                  title={highlight.description}
                                  placement="left"
                                >
                                  <MenuItem
                                    selected={
                                      layer.source?.highlighting?.type ===
                                        highlight.type &&
                                      layer.source?.highlighting?.step ===
                                        selected?.current?.step
                                    }
                                    sx={{
                                      height: 32,
                                      flex: 1,
                                      borderLeft: `4px solid ${highlightColor}`,
                                    }}
                                    onClick={() => {
                                      showHighlight[highlight.type](
                                        selected?.current?.step!
                                      );
                                      setMenuOpen(false);
                                    }}
                                  >
                                    <Box sx={{ ml: -0.5, pr: 4 }}>
                                      <Label
                                        primary={startCase(highlight.type)}
                                      />
                                    </Box>
                                  </MenuItem>
                                </Tooltip>
                              </Stack>
                            );
                          })}
                        </>
                      )}
                    </MenuList>
                  </Menu>
                </>
              ) : (
                <Placeholder
                  icon={<AccountTreeOutlined />}
                  label="Graph"
                  secondary={`${inferLayerName(layer)} is not a graph.`}
                />
              )
            ) : (
              <Flex
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
              </Flex>
            )
          ) : (
            <Placeholder
              icon={<AccountTreeOutlined />}
              label="Graph"
              secondary="When you load a trace that has tree-like data, you'll see it here as a decision tree."
            />
          )}
        </Flex>
      </Page.Content>
      <Page.Options>
        {map(
          [
            {
              icon: <LayersIcon />,
              label: "Layer",
              value: key,
              items: map(allLayers, (l) => ({
                id: l.key,
                hidden: !find(layers, { key: l.key }),
                name: inferLayerName(l),
              })),
              onChange: setKey,
            },
            {
              icon: <ModeStandbyOutlined />,
              label: "Layout",
              value: mode,
              onChange: setMode as any,
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
                ...map(properties, (k) => ({ id: k, name: `$.${k}` })),
              ],
            },
          ],
          ({ icon, label, value, items, onChange }, i) => (
            <>
              {!!i && divider}
              <FeaturePicker
                icon={icon}
                label={label}
                value={value}
                items={items}
                onChange={onChange}
                arrow
              />
            </>
          )
        )}
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
