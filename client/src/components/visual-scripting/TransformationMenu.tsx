import { Stack, useTheme } from "@mui/material";
import {
  addEdge,
  Background,
  Controls,
  Node,
  OnConnect,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { Button } from "components/generic/inputs/Button";
import { useSurface } from "components/generic/surface";
import { useSurfaceAvailableCssSize } from "components/generic/surface/useSurfaceSize";
import { nanoid } from "nanoid";
import React, { useMemo } from "react";

type TransformationMenuProps = {
  variable: string;
};

export default function TransformationMenu({
  variable,
}: TransformationMenuProps) {
  const { dialog, open } = useSurface(FlowPopup, {
    title: `Value graph: ${variable}`,
    slotProps: {
      paper: {
        sx: { maxWidth: "90vw" },
      },
    },
  });

  return (
    <>
      <Button onClick={() => open({ nodeName: variable })} size="small">
        Open transformation menu
      </Button>
      {dialog}
    </>
  );
}

function FlowPopup({
  nodeName,
  onNodeChange,
}: {
  nodeName?: string;
  onNodeChange?: (node: Node) => void;
}) {
  const size = useSurfaceAvailableCssSize();
  const sourceNode: Node = nodeName
    ? {
        id: nodeName,
        position: { x: window.innerWidth * 0.65, y: window.innerHeight * 0.45 },
        data: { label: nodeName },
      }
    : { id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" } };
  return (
    <Stack sx={size}>
      <TransformationCanvas source={sourceNode} />
    </Stack>
  );
}

type TransformationCanvasProps = {
  source: Node;
};

function TransformationCanvas({ source }: TransformationCanvasProps) {
  const id = useMemo(() => nanoid(), []);

  const [nodes, setNodes, onNodesChange] = useNodesState([source]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = React.useCallback<OnConnect>(
    (c) => setEdges((e) => addEdge(c, e)),
    []
  );
  const initialNodes = [source];
  const theme = useTheme();
  return (
    <ReactFlowProvider>
      <ReactFlow
        colorMode={theme.palette.mode}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Background id={id} bgColor={theme.palette.background.paper} />
        <Controls />
      </ReactFlow>
    </ReactFlowProvider>
  );
}
