import {
  AccountTreeOutlined,
  CenterFocusStrongOutlined,
  DataObjectOutlined,
  LayersOutlined as LayersIcon,
  ModeStandbyOutlined,
  FlipCameraAndroidOutlined as RotateIcon,
} from "@mui/icons-material";
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
  SxProps,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  SigmaContainer,
  useLoadGraph,
  useRegisterEvents,
  useSigma,
} from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { useWorkerLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { EdgeCurvedArrowProgram } from "@sigma/edge-curve";
import interpolate from "color-interpolate";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import {
  MinimisedPlaybackControls,
  PlaybackLayerData,
} from "components/app-bar/Playback";
import { Flex } from "components/generic/Flex";
import { IconButtonWithTooltip } from "components/generic/IconButtonWithTooltip";
import { Label } from "components/generic/Label";
import { Placeholder } from "components/inspector/Placeholder";
import {
  PropertyDialog,
  PropertyList,
} from "components/inspector/PropertyList";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { getColorHex } from "components/renderer/colors";
import { MultiDirectedGraph } from "graphology";
import { usePlaybackState } from "hooks/usePlaybackState";
import { inferLayerName } from "layers/inferLayerName";
import { getLayerHandler } from "layers/layerHandlers";
import { TraceLayerData } from "layers/trace";
import {
  Dictionary,
  entries,
  filter,
  find,
  findLast,
  forEach,
  forEachRight,
  isNull,
  isUndefined,
  map,
  max,
  slice,
  startCase,
  truncate,
} from "lodash";
import memoizee from "memoizee";
import { Trace } from "protocol";
import { ComponentProps, FC, useEffect, useMemo, useState } from "react";
import { useThrottle } from "react-use";
import AutoSize from "react-virtualized-auto-sizer";
import { EdgeArrowProgram } from "sigma/rendering";
import { Layer, useLayer } from "slices/layers";
import { PanelState } from "slices/view";
import { useAcrylic, usePaper } from "theme";
import { PageContentProps } from "./PageMeta";
import { useTreeMemo } from "./TreeWorker";
import { Key, TreeWorkerReturnType } from "./tree.worker";

const isDefined = (a: any) => !isUndefined(a) && !isNull(a);

export const divider = (
  <Divider orientation="vertical" flexItem sx={{ m: 1 }} />
);

type TreePageContext = PanelState;

export function useCache<T>(result: T, loading: boolean = false) {
  const [cache, setCache] = useState<T>();

  useEffect(() => {
    if (!loading) {
      if (result) {
        setCache(result);
      }
    }
  }, [result, loading]);
  return cache;
}

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

const orientationOptions = {
  horizontal: {
    value: "horizontal",
  },
  vertical: {
    value: "vertical",
  },
};

const ForceAtlas: FC = () => {
  const { start, kill } = useWorkerLayoutForceAtlas2({
    settings: { slowDown: 10, gravity: 2, adjustSizes: true, linLogMode: true },
  });

  useEffect(() => {
    // start FA2
    start();

    // Kill FA2 on unmount
    return () => {
      kill();
    };
  }, [start, kill]);

  return null;
};

type R = {
  event: MouseEvent;
  node: string;
};

export function GraphEvents({
  onSelection,
  layer,
}: {
  layer?: string;
  onSelection?: (e: R) => void;
}) {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      clickNode: (e) => {
        // const step = sigma.getGraph().getNodeAttribute(e.node, "step");
        onSelection?.({ event: e.event.original, node: e.node });
      },
      enterNode: () => {
        document.body.style.cursor = "pointer";
      },
      leaveNode: () => {
        document.body.style.cursor = "";
      },
    });
  }, [layer, registerEvents, sigma]);
  return null;
}

export function TreeGraph({
  trace,
  tree,
  step = 0,
  layer,
  showAllEdges,
}: {
  trace?: Trace;
  tree?: TreeWorkerReturnType;
  step?: number;
  layer?: Layer<PlaybackLayerData>;
  showAllEdges?: boolean;
}) {
  const sigma = useSigma();
  const [orientation, setOrientation] =
    useState<keyof typeof orientationOptions>("vertical");
  const paper = usePaper();
  const acrylic = useAcrylic();
  const theme = useTheme();
  const gradient = interpolate([
    theme.palette.background.paper,
    theme.palette.text.primary,
  ]);
  const load = useLoadGraph();

  const finalParents = useMemo(() => getFinalParents(trace), [trace]);

  const graph = useMemo(() => {
    const isVertical = orientation === "vertical";
    const graph = new MultiDirectedGraph();
    forEach(tree, (v) => {
      graph.addNode(v.label, {
        x: isVertical ? v.x : -v.y,
        y: isVertical ? v.y : -v.x,
        label: v.label,
        size: Math.log(v.size) + 2,
        color: theme.palette.action.disabledBackground,
      });
    });

    const numParents: Dictionary<Set<string | number>> = {};
    forEach(trace?.events, ({ id, pId, type }, i) => {
      if (id && pId) {
        numParents[id] = numParents[id] ?? new Set();
        numParents[id].add(pId);
      }
    });

    forEach(trace?.events, ({ id, pId }) => {
      if (isDefined(pId) && graph.hasNode(`${pId}`)) {
        const key = makeEdgeKey(id, pId);
        if (!graph.hasEdge(key)) {
          graph.addDirectedEdgeWithKey(key, `${pId}`, `${id}`, {
            label: "",
            color: "white",
            size: 2,
            final: finalParents[id] === pId,
          });
        }
        graph.updateEdgeAttribute(
          key,
          "size",
          (s) => Math.log(Math.E ** (s - 0.5) + 0.5) + 0.5
        );
      }
    });
    return graph;
  }, [load, trace, tree, finalParents, orientation]);
  useEffect(() => {
    const r = memoizee((a: string) =>
      interpolate([theme.palette.background.paper, a])
    );
    const pastSteps = 400;
    const n = gradient(0.1);
    graph.forEachNode((v) => {
      graph.setNodeAttribute(v, "color", n);
      graph.setNodeAttribute(v, "forceLabel", false);
      graph.setNodeAttribute(v, "label", truncate(v, { length: 15 }));
    });
    graph.forEachEdge((v) => {
      const isFinal = graph.getEdgeAttribute(v, "final");
      graph.setEdgeAttribute(v, "color", n);
      graph.setEdgeAttribute(v, "hidden", !showAllEdges && !isFinal);
      graph.setEdgeAttribute(v, "forceLabel", false);
      graph.setEdgeAttribute(v, "label", "");
    });
    const isSetNode: Dictionary<boolean> = {};
    const isSet: Dictionary<boolean> = {};
    (showAllEdges ? forEach : forEachRight)(
      slice(trace?.events, 0, step + 1),
      ({ id, type, pId }, i) => {
        const color = getColorHex(type);
        const finalColor = r(color)(max([1 - (step - i) / pastSteps, 0.2])!);
        if (graph.hasNode(`${id}`) && !isSetNode[id]) {
          graph.setNodeAttribute(`${id}`, "color", finalColor);
          graph.setNodeAttribute(
            `${id}`,
            "label",
            truncate(`${startCase(type)} ${id}`, { length: 15 })
          );
          graph.setNodeAttribute(`${id}`, "forceLabel", step === i);
          const a = makeEdgeKey(id, pId);
          if (
            isDefined(pId) &&
            graph.hasNode(`${pId}`) &&
            graph.hasEdge(a) &&
            !isSet[a]
          ) {
            graph.setEdgeAttribute(a, "forceLabel", step === i);
            graph.setEdgeAttribute(a, "color", finalColor);
            graph.setEdgeAttribute(a, "label", `Step ${i}`);
            graph.setEdgeAttribute(a, "hidden", false);
            if (!showAllEdges) isSet[a] = true;
          }
          if (!showAllEdges) isSetNode[id] = true;
        }
      }
    );
    load(graph);
  }, [graph, step, trace, showAllEdges]);
  return (
    <Stack sx={{ pt: 6, position: "absolute", top: 0, left: 0 }}>
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
            setOrientation(
              orientation === "vertical" ? "horizontal" : "vertical"
            );
          }}
          label="Rotate"
          icon={<RotateIcon />}
        ></IconButtonWithTooltip>
        {divider}
        <IconButtonWithTooltip
          color="primary"
          onClick={() => {
            sigma?.getCamera?.()?.animatedReset?.();
          }}
          label="Fit"
          icon={<CenterFocusStrongOutlined />}
        ></IconButtonWithTooltip>
        {divider}
        {<MinimisedPlaybackControls layer={layer} />}
      </Stack>
    </Stack>
  );
}

function makeEdgeKey(
  id: string | number,
  pId: string | number | null | undefined
): string {
  return `${id}::${pId}`;
}

const stepsLayerGuard = (
  l: Layer
): l is Layer<PlaybackLayerData & TraceLayerData> => !!getLayerHandler(l).steps;

export function TreePage({ template: Page }: PageContentProps) {
  const { key, setKey, layer, layers, allLayers } = useLayer(
    undefined,
    stepsLayerGuard
  );
  const theme = useTheme();
  const { controls, onChange, state, dragHandle } =
    useViewTreeContext<TreePageContext>();

  const step = useThrottle(layer?.source?.step ?? 0, 1000 / 24);

  const { stepTo } = usePlaybackState(key);

  const [orientation, setOrientation] =
    useState<keyof typeof orientationOptions>("vertical");

  const trace = layer?.source?.trace?.content;

  const [selection, setSelection] = useState<R>();
  const [menuOpen, setMenuOpen] = useState(false);

  const [mode, setMode] = useState<"tree" | "directed-graph">("directed-graph");

  const selected = useMemo(() => {
    const events = filter(
      map(trace?.events, (c, i) => ({ event: c, step: i })),
      (c) => `${c.event.id}` === selection?.node
    );

    return { events, current: findLast(events, (c) => c.step <= step) };
  }, [selection, step]);

  const params = useMemo(() => ({ trace, mode }), [trace, mode]);

  const { result: tree, loading } = useTreeMemo(params, [params]);

  const settings = useMemo(
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
      <Page.Title>Tree</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Flex>
          {trace ? (
            !loading ? (
              tree?.length ? (
                <>
                  <AutoSize>
                    {(size) => (
                      <SigmaContainer
                        style={{
                          ...size,
                          background: theme.palette.background.paper,
                        }}
                        graph={MultiDirectedGraph}
                        settings={settings}
                      >
                        <TreeGraph
                          step={step}
                          tree={tree}
                          trace={trace}
                          layer={layer}
                          showAllEdges={layoutModes[mode].showAllEdges}
                        />
                        <GraphEvents
                          layer={key}
                          onSelection={(e) => {
                            setSelection(e);
                            setMenuOpen(true);
                          }}
                        />
                        {/* <ForceAtlas /> */}
                      </SigmaContainer>
                    )}
                  </AutoSize>
                  <Menu
                    onClose={() => setMenuOpen(false)}
                    anchorReference="anchorPosition"
                    anchorPosition={{
                      left: selection?.event.clientX ?? 0,
                      top: selection?.event.clientY ?? 0,
                    }}
                    transformOrigin={{
                      horizontal: "left",
                      vertical: "top",
                    }}
                    open={menuOpen}
                  >
                    <MenuList dense sx={{ p: 0 }}>
                      {!!selected.current && (
                        <>
                          <ListItem sx={{ py: 0 }}>
                            <Typography
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
                          <Divider sx={{ my: 1, mx: 2 }} />
                        </>
                      )}
                      <ListItem sx={{ py: 0 }}>
                        <Typography color="text.secondary" variant="overline">
                          Events at {selection?.node}
                        </Typography>
                      </ListItem>
                      {map(selected.events, (entry, _, es) => {
                        const selected =
                          findLast(es, (c) => c.step <= step)?.step ===
                          entry.step;
                        return (
                          <Stack direction="row">
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
                              <Tooltip title={`Go to step ${entry.step}`}>
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
                              </Tooltip>
                            </MenuItem>
                            <Box sx={{ flex: 0 }}>
                              <PropertyDialog
                                {...{ event: entry.event }}
                                trigger={(onClick) => (
                                  <MenuItem
                                    selected={selected}
                                    {...{ onClick }}
                                    sx={{ pr: 0 }}
                                  >
                                    <Tooltip title="See all properties">
                                      <ListItemIcon>
                                        <DataObjectOutlined />
                                      </ListItemIcon>
                                    </Tooltip>
                                  </MenuItem>
                                )}
                              />
                            </Box>
                          </Stack>
                        );
                      })}
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
                <Typography variant="body2" sx={{ px: 8, maxWidth: 480 }}>
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
        <FeaturePicker
          icon={<LayersIcon />}
          label="Layer"
          value={key}
          items={map(allLayers, (l) => ({
            id: l.key,
            hidden: !find(layers, { key: l.key }),
            name: inferLayerName(l),
          }))}
          onChange={setKey}
          arrow
          ellipsis={12}
        />
        {divider}
        <FeaturePicker
          icon={<ModeStandbyOutlined />}
          label="Layout"
          value={mode}
          onChange={setMode as any}
          items={map(entries(layoutModes), ([k, v]) => ({
            id: k,
            ...v,
          }))}
          arrow
        />
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
export function getFinalParents(trace: Trace | undefined) {
  const finalParent: Dictionary<Key> = {};
  forEach(trace?.events, ({ id, pId }) => {
    finalParent[id] = pId;
  });
  return finalParent;
}
