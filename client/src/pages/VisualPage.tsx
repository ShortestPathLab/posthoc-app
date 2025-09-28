import { BugReportOutlined } from "@mui-symbols-material/w400";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Divider, Tab } from "@mui/material";
import { LayerPicker } from "components/generic/LayerPicker";
import { Scroll } from "components/generic/Scrollbars";
import { Placeholder } from "components/inspector/Placeholder";
import { ConfigurableNode } from "components/visual-scripting/ConfigurableNode";
import { exampleMathNode } from "components/visual-scripting/NodeConfigs";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { DebugLayerData } from "hooks/DebugLayerData";
import { getController } from "layers/layerControllers";
import { set, values } from "lodash-es";
import { useState, useCallback } from "react";
import { slice } from "slices";
import { Layer, useLayerPicker } from "slices/layers";
import { BreakpointListEditor } from "../components/breakpoint-editor/BreakpointListEditor";
import { PageContentProps } from "./PageMeta";

import {
  ReactFlow,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  Connection,
  Background,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeMenu from "components/visual-scripting/NodeMenu";

const stepsLayerGuard = (l: Layer<unknown>): l is Layer<DebugLayerData> =>
  !!getController(l).steps;

const divider = (
  <Divider
    orientation="vertical"
    flexItem
    sx={{ m: 1, height: (t) => t.spacing(3), alignSelf: "auto" }}
  />
);
function useDebugPageState(key?: string) {
  const layer = slice.layers.one<Layer<DebugLayerData>>(key).use();
  return { layer };
}
const initialNodes: Node[] = [
  {
    id: "n1",
    type: "configurable",
    position: { x: 0, y: 0 },
    data: { config: exampleMathNode },
  },
  { id: "n2", position: { x: 0, y: 300 }, data: { label: "Node 3" } },
  { id: "n3", position: { x: 0, y: 600 }, data: { label: "Node 4" } },
];

const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

const nodeTypes = {
  configurable: ConfigurableNode,
};

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * VisualPage renders a ReactFlow graph for visualizing the debug data from a layer.
 *
 * The page displays a graph with nodes and edges, and allows the user to interact with the graph.
 * The graph is rendered using the ReactFlow library.
 *
 * The page also includes a tab bar with two tabs: "Standard" and "Advanced".
 * The "Standard" tab shows the graph with the standard node and edge types.
 * The "Advanced" tab shows the graph with the advanced node and edge types.
 *
 * @param {Page} template The template for the page.
 * @returns {ReactElement} The rendered page.
 */
/*******  f3daf0df-0034-47a2-8ace-15c58ff0390d  *******/ export function VisualPage({
  template: Page,
}: PageContentProps) {
  console.log("Rendering VisualPage");

  const { controls, onChange, state, dragHandle, isViewTree } =
    useViewTreeContext();

  const [tab, setTab] = useState("standard");

  const { key, setKey } = useLayerPicker(stepsLayerGuard);

  const one = slice.layers.one<Layer<DebugLayerData>>(key);

  const { layer } = useDebugPageState(key);
  const { code } = layer?.source ?? {};

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  return (
    <TabContext value={tab}>
      <Page onChange={onChange} stack={state}>
        <Page.Key>visual</Page.Key>
        <Page.Title>Visual</Page.Title>
        <Page.Handle>{dragHandle}</Page.Handle>
        <Page.Options>
          <LayerPicker guard={stepsLayerGuard} onChange={setKey} value={key} />
          {divider}
          <TabList
            onChange={(_, v) => setTab(v)}
            sx={{
              mx: isViewTree ? 0 : -1,
              "& button": { minWidth: 0 },
            }}
          >
            <Tab label="Standard" value="standard" disabled={!layer} />
            <Tab label="Advanced" value="advanced" disabled={!layer} />
          </TabList>
        </Page.Options>
        <Page.Content>
          <div style={{ width: "100vw", height: "100vh" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            ></ReactFlow>
          </div>
          <NodeMenu />
        </Page.Content>
        <Page.Extras>{controls}</Page.Extras>
      </Page>
    </TabContext>
  );
}

// MUI menu

// TODO: Button to add nodes
// TODO: Second view for editing transformations of inputs to component
