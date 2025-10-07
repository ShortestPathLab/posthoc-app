import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { addEdge, Node, ReactFlow, ReactFlowProvider, useNodesState, useEdgesState, OnConnect, Background, Controls} from '@xyflow/react';
import { Button } from 'components/generic/inputs/Button';

type TransformationMenuProps = {
  variable: string;
};

export default function TransformationMenu({ variable }: TransformationMenuProps) {
  const [open, setOpen] = React.useState(false);

  const handleOpen = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => setOpen(true),
    []
  );
  const handleClose = React.useCallback(() => setOpen(false), []);

  return (
    <>
      <Button onClick={handleOpen} size="small">
        Open transformation menu
      </Button>

      <FlowPopup
        isOpen={open}
        onClose={handleClose}
        nodeName={variable}
        onNodeChange={() => {}}
      />
    </>
  );
}
function FlowPopup({
      nodeName,
      onNodeChange,
      isOpen,
      onClose,
    }: {
      nodeName?: string;
      onNodeChange: (node: Node) => void;
      isOpen: boolean;
      onClose: () => void;
    }) {

      const sourceNode: Node = nodeName ? 
                      { id: nodeName, position: {x: window.innerWidth * 0.65 , y: window.innerHeight * 0.45}, data: {label: nodeName} } :
                      { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } };
        return (
            <Dialog open={isOpen} onClose={onClose} keepMounted maxWidth="lg" fullWidth>
            <DialogTitle>{String(sourceNode.data.label)}</DialogTitle>
            <DialogContent
              sx={{
                height: 800,
                width: "100%",
                overflow: "hidden",
                "& .react-flow": { backgroundColor: "background.default" },
                p: 0,                 
              }}
              >
                <ReactFlowProvider>
                  <TransformationCanvas source={sourceNode} />
                  <Background />
                  <Controls />
                </ReactFlowProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
            </Dialog>
        );
    };


type TransformationCanvasProps = {
  source: Node;
};

function TransformationCanvas({ source }: TransformationCanvasProps) {

  const [nodes, setNodes, onNodesChange] = useNodesState([source]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = React.useCallback<OnConnect>(
    (c) => setEdges((e) => addEdge(c, e)),
    []
  );
  const initialNodes = [source];

  return (
    <ReactFlow
    nodes={nodes}
    edges={edges}
    onNodesChange={onNodesChange}
    onEdgesChange={onEdgesChange}
    onConnect={onConnect}
    />
  );
}