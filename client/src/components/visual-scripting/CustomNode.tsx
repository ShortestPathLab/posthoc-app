import * as React from "react";
import { useCallback, useMemo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Stack, TextField } from "@mui/material";
import { usePaper } from "theme";
import TransformationMenu from "./TransformationMenu";

type Data = {
  label?: string;
  description?: string;
  [key: string]: unknown;
};

export function TextUpdaterNode(props: NodeProps<Node<Data>>) {
  const { id, data, positionAbsoluteX, positionAbsoluteY } = props;

  const paper = usePaper();

  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
    // You can call a prop to update node data if you wired it up via onNodesChange
  }, []);

  // Build a minimal Node object to pass down if you need it:
  const node: Node = useMemo(
    () => ({
      id,
      data,
      position: { x: positionAbsoluteX ?? 0, y: positionAbsoluteY ?? 0 },
      type: props.type,
    }),
    [id, data, positionAbsoluteX, positionAbsoluteY, props.type],
  );

  return (
    <Stack
      className="text-updater-node"
      sx={{
        ...paper(),
        p: 2,
        gap: 1.5,
      }}
    >
      <TextField
        label="text"
        defaultValue={data?.label ?? ""}
        onChange={onChange}
        size="small"
        className="nodrag"
      />

      {/* Optional “inline” transformation menu (e.g. kebab menu) */}
      <TransformationMenu variable={node.id} />

      {/* Handles — fixed the incorrect Position on the left handle */}
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Bottom} id="bot" />
      <Handle type="source" position={Position.Left} id="left" />
    </Stack>
  );
}
