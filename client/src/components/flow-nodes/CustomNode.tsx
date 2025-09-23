import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Stack, TextField } from "@mui/material";
import { usePaper } from "theme";
import { Button } from "components/generic/inputs/Button";
import { useSurface } from "components/generic/surface";
import type { XYPosition } from "@xyflow/react";

import TransformationMenu from "./TransformationMenu";

// Optional: don’t shadow MUI’s Dialog type name
function SurfaceDialogStub() {
  return <div>Dialog</div>;
}


type Data = {
  id: string;
  label?: string;
  description?: string;
  position: XYPosition;
  data: Record<string, unknown>;
};

export function TextUpdaterNode(props: NodeProps<Data>) {
  const { id, data, positionAbsoluteX, positionAbsoluteY } = props;

  // If you use useSurface elsewhere, you can still keep it:
  const { open, dialog } = useSurface(SurfaceDialogStub, {
    title: "Event properties",
  });

  const paper = usePaper();

  // Local state for the popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenFlowPopup = useCallback(() => setIsPopupOpen(true), []);
  const handleCloseFlowPopup = useCallback(() => setIsPopupOpen(false), []);

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
    [id, data, positionAbsoluteX, positionAbsoluteY, props.type]
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
      <TransformationMenu node={node} />


      {/* Handles — fixed the incorrect Position on the left handle */}
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Bottom} id="bot" />
      <Handle type="source" position={Position.Left} id="left" />

      {/* Keep any extra surface dialog content you use elsewhere */}
      {dialog}
    </Stack>
  );
}
