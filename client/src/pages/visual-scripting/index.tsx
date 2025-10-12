import {
  Box,
  Divider,
  ListItemText,
  MenuItem,
  MenuList,
  Stack,
  Tab,
  Typography,
  useTheme,
} from "@mui/material";
import { LayerPicker } from "components/generic/LayerPicker";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { FlowNode } from "components/visual-scripting/FlowNode";
import { transforms } from "components/visual-scripting/NodeConfigs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Layer, useLayerPicker } from "slices/layers";
import { PageContentProps } from "../PageMeta";

import { AddOutlined } from "@mui-symbols-material/w400";
import { TabContext, TabList } from "@mui/lab";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Spinner } from "components/generic/Spinner";
import { Button } from "components/generic/inputs/Button";
import { Surface } from "components/generic/surface";
import { Placeholder } from "components/inspector/Placeholder";
import { traceToNodes } from "components/visual-scripting/traceToNodes";
import { TraceLayerData } from "layers/trace/TraceLayer";
import { isTraceLayer } from "layers/trace/isTraceLayer";
import { chain, head, keys, map, startCase } from "lodash-es";
import { bindTrigger } from "material-ui-popup-state";
import { nanoid } from "nanoid";
import { TraceComponent } from "protocol/Trace-v140";
import { useAsync } from "react-async-hook";
import { slice } from "slices";
import { useAcrylic, usePaper } from "theme";
import { getLayoutedElements } from "./autoLayout";

const flowKey = "visual-flow";

const divider = (
  <Divider
    orientation="vertical"
    flexItem
    sx={{ m: 1, height: (t) => t.spacing(3), alignSelf: "auto" }}
  />
);

export const VisualScriptingContext = createContext<{
  hasDefinition: (s: string) => boolean;
  goToDefinition: (s: string) => void;
}>({
  hasDefinition: () => false,
  goToDefinition: () => {},
});

export const useVisualScriptingContext = () =>
  useContext(VisualScriptingContext);

const nodeTypes = {
  flow: FlowNode,
};

/**
 * VisualPage renders a ReactFlow graph for visualizing the debug data from a layer.
 *
 * The page displays a graph with nodes and edges, and allows the user to interact with the graph.
 * The graph is rendered using the ReactFlow library.
 */
export function VisualPage({ template: Page }: PageContentProps) {
  const id = useMemo(() => nanoid(), []);
  const {
    controls,
    onChange,
    state: { tab = "", edges, nodes, ...state } = { type: "" },
    dragHandle,
    isViewTree,
  } = useViewTreeContext<{
    tab?: string;
    edges?: Edge[];
    nodes?: Node[];
  }>();

  const { key, setKey } = useLayerPicker(isTraceLayer);

  const content = slice.layers
    .one<Layer<TraceLayerData>>(key)
    .use((l) => l.source?.trace?.content);

  const tabs = keys(content?.views);

  useEffect(() => {
    if (tabs.length) {
      onChange?.((v) => void (v.tab = head(tabs)!));
    }
  }, [JSON.stringify(tabs)]);

  const { loading } = useAsync(async () => {
    const a = content?.views?.[tab];
    if (a) {
      const { nodes, edges } = traceToNodes(a as TraceComponent[]);
      const layouted = await getLayoutedElements(nodes, edges);
      onChange?.((v) => {
        v.nodes = layouted.nodes;
        v.edges = layouted.edges;
      });
    }
  }, [tab]);

  const [rfInstance, setRfInstance] = useState<any>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      onChange?.((v) => {
        v.nodes = applyNodeChanges(changes, v.nodes ?? []);
      }),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      onChange?.((v) => {
        v.edges = applyEdgeChanges(changes, v.edges ?? []);
      }),
    []
  );
  const onConnect = useCallback(
    (params: Connection) =>
      onChange?.((v) => {
        v.edges = addEdge(params, v.edges ?? []);
      }),
    []
  );

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      // Not sure what we're trying to accomplish with a save feature.
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = localStorage.getItem(flowKey)
        ? JSON.parse(localStorage.getItem(flowKey)!)
        : null;
      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        onChange?.((v) => {
          v.nodes = flow.nodes;
          v.edges = flow.edges;
        });
        rfInstance?.setViewport?.({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [rfInstance]);

  const context = useMemo(
    () => ({
      hasDefinition: (s: string) => !!content?.views?.[s],
      goToDefinition: (s: string) => onChange?.((v) => void (v.tab = s)),
    }),
    [content]
  );

  const theme = useTheme();
  const paper = usePaper();
  const acrylic = useAcrylic();

  return (
    <TabContext value={tab}>
      <Page onChange={onChange} stack={state}>
        <Page.Key>visual</Page.Key>
        <Page.Title>Visual Scripting</Page.Title>
        <Page.Handle>{dragHandle}</Page.Handle>
        <Page.Options>
          <LayerPicker guard={isTraceLayer} onChange={setKey} value={key} />
          {divider}
          <TabList
            onChange={(_, v) => onChange?.((s) => void (s.tab = v))}
            sx={{
              mx: isViewTree ? 0 : -1,
              "& button": { minWidth: 0 },
            }}
          >
            {tabs?.map?.((t) => <Tab label={`View: ${t}`} value={t} key={t} />)}
          </TabList>
        </Page.Options>
        <Page.Content>
          {content ? (
            content?.version === "1.4.0" ? (
              <VisualScriptingContext.Provider value={context}>
                <Box sx={{ width: "100%", height: "100%" }} key={tab}>
                  {loading ? (
                    <Spinner message="Loading graph" />
                  ) : (
                    <ReactFlowProvider>
                      <ReactFlow
                        colorMode={theme.palette.mode}
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setRfInstance}
                        fitView
                      >
                        <Controls />
                        <Background
                          id={id}
                          bgColor={theme.palette.background.paper}
                        />
                      </ReactFlow>
                    </ReactFlowProvider>
                  )}
                  <Stack
                    direction="row-reverse"
                    spacing={1}
                    sx={{
                      ...paper(),
                      ...acrylic,
                      p: 1,
                      position: "absolute",
                      top: 60,
                      right: 16,
                      zIndex: 4,
                    }}
                  >
                    <Surface
                      popover
                      slotProps={{
                        paper: { sx: { width: "fit-content" } },
                        popover: {
                          anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "right",
                          },
                        },
                      }}
                      trigger={(state) => (
                        <Button
                          {...bindTrigger(state)}
                          startIcon={<AddOutlined />}
                        >
                          Add node
                        </Button>
                      )}
                    >
                      {(state) => (
                        <MenuList>
                          {chain(transforms)
                            .entries()
                            .map(([k, v]) => [k, v()] as const)
                            .groupBy(([, v]) => v.group)
                            .omitBy((vs, k) => k === "hidden")
                            .map((vs, group) => (
                              <>
                                <MenuItem disabled>
                                  <Typography variant="overline">
                                    {startCase(group)}
                                  </Typography>
                                </MenuItem>
                                {map(vs, ([k, v]) => (
                                  <MenuItem
                                    key={k}
                                    onClick={() => {
                                      state.close();
                                      onChange?.((s) => {
                                        const id = `n${+new Date()}`;
                                        s.nodes = s.nodes ?? [];
                                        s.nodes?.push?.({
                                          id,
                                          type: "flow",
                                          data: {
                                            type: k,
                                            key: id,
                                          },
                                          position: {
                                            x: Math.random() * 400,
                                            y: Math.random() * 400,
                                          },
                                        });
                                      });
                                    }}
                                  >
                                    <ListItemText
                                      primary={v.title}
                                      secondary={v.description}
                                    />
                                  </MenuItem>
                                ))}
                              </>
                            ))
                            .value()}
                        </MenuList>
                      )}
                    </Surface>

                    <Button variant="contained" onClick={onRestore}>
                      Restore
                    </Button>

                    <Button variant="contained" onClick={onSave}>
                      Save
                    </Button>
                  </Stack>
                </Box>
              </VisualScriptingContext.Provider>
            ) : (
              <Placeholder
                label="Unsupported trace version"
                secondary="The visual scripting editor only supports trace version 1.4.0"
              />
            )
          ) : (
            <Placeholder
              label="Open a trace"
              secondary="Open a trace to use the visual scripting editor"
            />
          )}
        </Page.Content>
        <Page.Extras>{controls}</Page.Extras>
      </Page>
    </TabContext>
  );
}

// MUI menu

// TODO: Button to add nodes
// TODO: Second view for editing transformations of inputs to component
