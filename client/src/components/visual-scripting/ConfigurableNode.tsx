import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import {
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Box,
  Checkbox,
} from "@mui/material";
import { usePaper } from "theme";
import { Button } from "components/generic/inputs/Button";
import { useSurface } from "components/generic/surface";
import type { XYPosition } from "@xyflow/react";

import TransformationMenu from "./TransformationMenu";
import { LabeledHandle, LabeledHandleProps } from "./LabeledHandle";

// Optional: don’t shadow MUI’s Dialog type name
function SurfaceDialogStub() {
  return <div>Dialog</div>;
}

export type NodeConfig = {
  title: string;
  inputs?: LabeledHandleProps[]; // list of handles on the left
  outputs?: LabeledHandleProps[]; // list of handles on the right
  fields?: {
    label: string;
    type: "text" | "number" | "checkbox";
    value: any;
  }[];
};

type ConfigurableNode = Node<{ config: NodeConfig }, "config">;

const HANDLE_SPACE_FROM_TOP = 60;
const HANDLE_SPACING = 25;

export function ConfigurableNode(props: NodeProps<ConfigurableNode>) {
  const { config } = props.data;

  // If you use useSurface elsewhere, you can still keep it:
  const { open, dialog } = useSurface(SurfaceDialogStub, {
    title: "Event properties",
  });

  const paper = usePaper();

  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
    // You can call a prop to update node data if you wired it up via onNodesChange
  }, []);

  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 160,
        borderRadius: 2,
        boxShadow: 2,
        position: "relative",
        overflow: "visible", // so handles can poke out
      }}
    >
      <CardContent>
        {/* Title */}
        <Typography variant="subtitle2" gutterBottom>
          {config.title}
        </Typography>

        {/* Input handles */}
        {config.inputs?.map((labeledHandle, i) => (
          <LabeledHandle
            {...labeledHandle}
            key={`in-${i}`}
            id={`in-${i}`}
            type="target"
            position={Position.Left}
            style={{ top: HANDLE_SPACE_FROM_TOP + i * HANDLE_SPACING }}
          />
        ))}

        {/* Output handles */}
        {config.outputs?.map((labeledHandle, i) => (
          <LabeledHandle
            {...labeledHandle}
            key={`out-${i}`}
            id={`out-${i}`}
            type="source"
            position={Position.Right}
            style={{ top: HANDLE_SPACE_FROM_TOP + i * HANDLE_SPACING }}
          />
        ))}

        {/* Fields */}
        {config.fields?.map((field, idx) => (
          <Box key={idx} mb={1}>
            {field.type === "text" && (
              <TextField
                size="small"
                label={field.label}
                defaultValue={field.value}
                fullWidth
              />
            )}
            {field.type === "number" && (
              <TextField
                type="number"
                size="small"
                label={field.label}
                defaultValue={field.value}
                fullWidth
              />
            )}
            {field.type === "checkbox" && (
              <Box display="flex" alignItems="center">
                <Checkbox defaultChecked={field.value} size="small" />
                <Typography variant="body2">{field.label}</Typography>
              </Box>
            )}
          </Box>
        ))}
      </CardContent>
    </Card>
    // <>
    //   <Typography variant="h3">{config.title}</Typography>
    //   <Stack
    //     sx={{
    //       ...paper(),
    //       p: 2,
    //       gap: 1.5,
    //     }}
    //   >

    //     {/* Input handles */}
    //     {config.inputs?.map((labeledHandle, i) => (
    //       <LabeledHandle
    //         {...labeledHandle}
    //         id={`in-${i}`}
    //         type="target"
    //         position={Position.Left}
    //       />
    //     ))}

    //     {/* Output handles */}
    //     {config.outputs?.map((labeledHandle, i) => (
    //       <LabeledHandle
    //         {...labeledHandle}
    //         id={`out-${i}`}
    //         type="source"
    //         position={Position.Right}
    //       />
    //     ))}

    //     {/* Keep any extra surface dialog content you use elsewhere */}
    //     {dialog}
    //   </Stack>
    // </>
  );
}
