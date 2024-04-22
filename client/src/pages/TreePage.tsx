import {
  AccountTreeOutlined,
  ChevronRightOutlined,
  DataObjectOutlined,
  LayersOutlined as LayersIcon,
} from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Tooltip,
  Typography,
  alpha,
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
import { Flex } from "components/generic/Flex";
import { Label } from "components/generic/Label";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { getColorHex } from "components/renderer/colors";
import { MultiDirectedGraph } from "graphology";
import { inferLayerName } from "layers/inferLayerName";
import {
  delay,
  filter,
  find,
  findLast,
  forEach,
  isNull,
  isUndefined,
  map,
  max,
  slice,
  startCase,
  truncate,
} from "lodash";
import PopupState, { bindMenu } from "material-ui-popup-state";
import memoizee from "memoizee";
import { Trace } from "protocol";
import { ComponentProps, FC, useEffect, useMemo, useState } from "react";
import { TreeProps, Tree as _Tree } from "react-d3-tree";
import { useThrottle } from "react-use";
import AutoSize from "react-virtualized-auto-sizer";
import { EdgeArrowProgram } from "sigma/rendering";
import { Layer, useLayer } from "slices/layers";
import { PanelState } from "slices/view";
import { PageContentProps } from "./PageMeta";
import { useTreeMemo } from "./TreeWorker";
import { EventTree } from "./tree.worker";
import { PlaybackLayerData } from "components/app-bar/Playback";
import { getLayerHandler } from "layers/layerHandlers";
import { TraceLayerData } from "layers/trace";
import { usePlaybackState } from "hooks/usePlaybackState";
import {
  PropertyDialog,
  PropertyList,
} from "components/inspector/PropertyList";

const isDefined = (a: any) => !isUndefined(a) && !isNull(a);

const divider = <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;

const Tree = _Tree as unknown as FC<TreeProps>;

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

const radius2 = {
  small: {
    value: 0,
    name: "Current",
    description: "Show the current node and its parents",
  },
  medium: {
    value: 4,
    name: "Nearby",
    description: "Show nodes with ≤4 degrees of separation",
  },
  infinite: {
    value: undefined,
    name: "All",
    description: "Show all nodes, may impact performance",
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
    settings: { slowDown: 10 },
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
}: {
  trace?: Trace;
  tree?: any;
  step?: number;
}) {
  const theme = useTheme();
  const gradient = interpolate([
    theme.palette.background.paper,
    theme.palette.text.primary,
  ]);
  const load = useLoadGraph();

  const graph = useMemo(() => {
    const graph = new MultiDirectedGraph();
    forEach(tree, (v) => {
      graph.addNode(v.label, {
        x: v.x,
        y: v.y,
        label: v.label,
        size: 3,
        color: theme.palette.action.disabledBackground,
      });
    });
    forEach(trace?.events, ({ id, pId }) => {
      if (isDefined(pId) && graph.hasNode(`${pId}`)) {
        const key = makeEdgeKey(id, pId);
        if (!graph.hasEdge(key)) {
          graph.addDirectedEdgeWithKey(key, `${pId}`, `${id}`, {
            label: "",
            color: "white",
          });
        }
      }
    });
    return graph;
  }, [load, trace, tree]);
  useEffect(() => {
    const r = memoizee((a: string) =>
      interpolate([theme.palette.background.paper, a])
    );
    const pastSteps = 200;
    const n = gradient(0.2);
    graph.forEachNode((v) => {
      graph.setNodeAttribute(v, "color", n);
      graph.setNodeAttribute(v, "label", truncate(v, { length: 15 }));
    });
    graph.forEachEdge((v) => {
      graph.setEdgeAttribute(v, "color", n);
      graph.setEdgeAttribute(v, "label", "");
    });
    forEach(slice(trace?.events, 0, step + 1), ({ id, type, pId }, i) => {
      const color = getColorHex(type);
      const finalColor = r(color)(max([1 - (step - i) / pastSteps, 0.2])!);
      if (graph.hasNode(`${id}`)) {
        graph.setNodeAttribute(`${id}`, "color", finalColor);
        graph.setNodeAttribute(
          `${id}`,
          "label",
          truncate(`${startCase(type)} ${id}`, { length: 15 })
        );
        if (isDefined(pId) && graph.hasNode(`${pId}`)) {
          graph.setEdgeAttribute(makeEdgeKey(id, pId), "color", finalColor);
          graph.setEdgeAttribute(makeEdgeKey(id, pId), "label", `Step ${i}`);
        }
      }
    });
    load(graph);
  }, [graph, step, trace]);
  return null;
}

function makeEdgeKey(
  id: string | number,
  pId: string | number | null | undefined
): unknown {
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
    useState<keyof typeof orientationOptions>("horizontal");

  const trace = layer?.source?.trace?.content;
  const [selection, setSelection] = useState<R>();
  const [menuOpen, setMenuOpen] = useState(false);

  const params = useMemo(() => ({ trace }), [trace]);

  const { result: tree, loading } = useTreeMemo(params, [params]);

  const settings = useMemo(
    () =>
      ({
        allowInvalidContainer: true,
        edgeLabelColor: { color: theme.palette.text.secondary },
        labelFont: "Inter",
        labelSize: 14,
        labelDensity: 1,
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
                      <TreeGraph step={step} tree={tree} trace={trace} />
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
                    <ListItem sx={{ py: 0 }}>
                      <Typography color="text.secondary" variant="overline">
                        Node {selection?.node}
                      </Typography>
                    </ListItem>
                    {map(
                      filter(
                        map(trace.events, (c, i) => ({ event: c, step: i })),
                        (c) => `${c.event.id}` === selection?.node
                      ),
                      (entry, _, es) => {
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
                                setMenuOpen(false);
                                stepTo(entry.step);
                              }}
                            >
                              <Tooltip title={`Go to step ${entry.step}`}>
                                <Box sx={{ ml: -0.5, pr: 4 }}>
                                  <Label
                                    primary={startCase(entry.event.type)}
                                    secondary={`Step ${entry.step}`}
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
                      }
                    )}
                  </MenuList>
                </Menu>
              </>
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
              label="Tree"
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
        {/* {divider} */}
        {/* <FeaturePicker
          icon={<VisibilityOutlined />}
          label="Radius"
          value={radius}
          onChange={(e) => setRadius(e as keyof typeof radius2)}
          items={map(entries(radius2), ([k, v]) => ({
            id: k,
            ...v,
          }))}
          arrow
        /> */}
        {/* {divider}
        <FeaturePicker
          icon={<RotateIcon />}
          label="Orientation"
          value={orientation}
          onChange={(e) => setOrientation(e as keyof typeof orientationOptions)}
          items={entries(orientationOptions).map(([key, value]) => ({
            id: key,
            name: startCase(value.value),
          }))}
          arrow
        /> */}
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}

const width = 16;
const height = 4;

function Node({
  onClick,
  node,
  step = 0,
  onStep,
}: {
  onClick?: () => void;
  node?: EventTree;
  step?: number;
  onStep?: (s: number) => void;
}) {
  const { palette, spacing, shape } = useTheme();
  const a = findLast(node?.events, (e) => e.step <= step);
  const isSelected = !!find(node?.events, (e) => e.step === step);
  const color = getColorHex(a?.data?.type);
  return (
    <PopupState variant="popover">
      {(state) => (
        <>
          <Tooltip
            title={`f: ${a?.data?.f ?? "unknown"}, g: ${
              a?.data?.g ?? "unknown"
            }`}
          >
            <g
              onClick={(e) => {
                state.open(e);
              }}
            >
              <clipPath id="clipPath">
                <rect
                  y={spacing(-height / 2)}
                  x={spacing(-0.25)}
                  strokeWidth={0}
                  width={spacing(width)}
                  height={spacing(height)}
                  rx={shape.borderRadius}
                />
              </clipPath>
              <rect
                y={spacing(-height / 2)}
                x={spacing(-0.25)}
                strokeWidth={0}
                fill={palette.background.default}
                width={spacing(width)}
                height={spacing(height)}
                clipPath="url(#clipPath)"
              />
              {isSelected && (
                <rect
                  y={spacing(-height / 2)}
                  x={spacing(-0.25)}
                  strokeWidth={0}
                  fill={alpha(
                    palette.primary.main,
                    palette.action.selectedOpacity
                  )}
                  width={spacing(width)}
                  height={spacing(height)}
                  clipPath="url(#clipPath)"
                />
              )}
              <rect
                x={spacing(-0.25)}
                y={spacing(-height / 2)}
                height={spacing(height)}
                width={spacing(0.5)}
                fill={color}
                strokeWidth={0}
                clipPath="url(#clipPath)"
              />
              <text
                strokeWidth={0}
                height={spacing(4)}
                fill={palette.text.primary}
                y={0}
                fontWeight={500}
                fontSize="0.875rem"
                x={spacing(2 - 0.25)}
                alignmentBaseline="central"
              >
                {node?.name}
              </text>
              {!!node?.cumulativeChildCount && (
                <>
                  <text
                    strokeWidth={0}
                    height={spacing(4)}
                    fill={palette.text.secondary}
                    y={0}
                    x={spacing(width - 2.25 - 1)}
                    textAnchor="end"
                    fontWeight={400}
                    fontSize="0.875rem"
                    alignmentBaseline="central"
                  >
                    {node?.cumulativeChildCount}
                  </text>
                  <ChevronRightOutlined
                    width={spacing(2)}
                    height={spacing(2)}
                    x={spacing(width - 2 - 1)}
                    y={spacing(-height / 2 + 1)}
                    strokeWidth={0}
                    fill={palette.text.primary}
                    opacity={palette.action.disabledOpacity}
                  />
                </>
              )}
            </g>
          </Tooltip>
          <Menu
            anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
            transformOrigin={{
              horizontal: "center",
              vertical: "top",
            }}
            {...bindMenu(state)}
          >
            <MenuList dense sx={{ p: 0 }}>
              {map(node?.events, (e) => (
                <MenuItem
                  selected={e.step === step}
                  sx={{
                    borderLeft: `4px solid ${getColorHex(e.data.type)}`,
                  }}
                  onClick={() => {
                    state.close();
                    onClick?.();
                    delay(() => onStep?.(e.step), 150);
                  }}
                >
                  <Label
                    primary={startCase(e.data.type)}
                    secondary={`Step ${e.step}`}
                  />
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </>
      )}
    </PopupState>
  );
}
