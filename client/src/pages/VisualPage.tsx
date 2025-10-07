import { Box, Button, Stack } from "@mui/material";
import { LayerPicker } from "components/generic/LayerPicker";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { ConfigurableTransformationNode } from "components/visual-scripting/ConfigurableTransformationNode";
import { exampleMathTransformation, exampleTileComponent } from "components/visual-scripting/NodeConfigs";
import { DebugLayerData } from "hooks/DebugLayerData";
import { getController } from "layers/layerControllers";
import { useCallback, useState } from "react";
import { Layer, useLayerPicker } from "slices/layers";
import { PageContentProps } from "./PageMeta";
import { ConfigurableComponentNode } from "components/visual-scripting/ConfigurableComponentNode";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  EdgeChange,
  Node,
  NodeChange,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeMenu from "components/visual-scripting/NodeMenu";

const flowKey = "visual-flow";

const visualScriptingLayerGuard = (
  l: Layer<unknown>
): l is Layer<DebugLayerData> =>
  // TODO: This needs to be a function that determines if the layer supports visual scripting
  !!getController(l).steps;

const initialNodes: Node[] = [
  {
    id: "main",
    type: "input",
    position: { x: 0, y: 0 },
    data: { label: "Main" },
    deletable: false,
  },
  {
    id: "math",
    type: "configurableTransformation",
    position: { x: 300, y: 0 },
    data: { config: exampleMathTransformation },
  },
  {
    id: "tile",
    type: "configurableComponent",
    position: { x: -100, y: 100},
    data: { config: exampleTileComponent },
  }
];




const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

const nodeTypes = {
  configurableTransformation: ConfigurableTransformationNode,
  configurableComponent: ConfigurableComponentNode,
};

/**
 * VisualPage renders a ReactFlow graph for visualizing the debug data from a layer.
 *
 * The page displays a graph with nodes and edges, and allows the user to interact with the graph.
 * The graph is rendered using the ReactFlow library.
 */
export function VisualPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle } = useViewTreeContext();

  const { key, setKey } = useLayerPicker(visualScriptingLayerGuard);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [rfInstance, setRfInstance] = useState<any>(null);

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
  
  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);
  
  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = localStorage.getItem(flowKey) ? JSON.parse(localStorage.getItem(flowKey)!) : null;
      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        rfInstance?.setViewport?.({ x, y, zoom });
        // setViewport({ x, y, zoom });
      }
    };
 
    restoreFlow();
  }, [rfInstance]);
  
  const onAdd = useCallback(() => {
    const newNode: Node = {
      id: `n${+new Date()}`,
      type: "configurable",
      data: { config: exampleMathTransformation },
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>visual</Page.Key>
      <Page.Title>Visual Scripting</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Options>
        <LayerPicker
          guard={visualScriptingLayerGuard}
          onChange={setKey}
          value={key}
        />
      </Page.Options>
      <Page.Content>
        <Box sx={{ width: "100vw", height: "100vh" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            fitView
          >
            <Background />
          </ReactFlow>
          <Stack
            direction="row-reverse"
            spacing={1}
            sx={{
              position: "absolute",
              top: 60,
              right: 16,
              zIndex: 4,
          }}
          >
            <Button
              variant="contained"
              onClick={onAdd}
            >
              Add Node
            </Button>
            
            <Button
              variant="contained"
              onClick={onRestore}
            >
              Restore
            </Button>
            
            <Button
              variant="contained"
              onClick={onSave}
            >
              Save
            </Button>
          </Stack>
        </Box>
        <NodeMenu />
      </Page.Content>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}

// MUI menu

// TODO: Button to add nodes
// TODO: Second view for editing transformations of inputs to component
