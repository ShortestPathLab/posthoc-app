/* eslint-disable react/display-name */
import {
  Box,
  Card,
  Checkbox,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Handle,
  NodeResizer,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useSurface } from "components/generic/surface";
import * as React from "react";
import { Fragment, useCallback } from "react";
import { useAcrylic, usePaper } from "theme";

import { map } from "lodash-es";
import { LabeledHandle, LabeledHandleProps } from "./LabeledHandle";
import TransformationMenu from "./TransformationMenu";
import { NodeBase } from "./NodeBase";
import { FlowData, Properties } from "./flow";

// Optional: don’t shadow MUI’s Dialog type name
function SurfaceDialogStub() {
  return <div>Dialog</div>;
}

export type ComponentNodeConfig = {
  title: string;
  vars: string[]; // list of variable names
};

type ConfigurableComponentNode = Node<FlowData<string, Properties>>;

export function ConfigurableComponentNode(
  props: NodeProps<ConfigurableComponentNode>
) {
  const { fields, type, key } = props.data;

  return (
    <NodeBase
      items={[
        () => (
          <Stack>
            <Typography key="title" variant="subtitle2" sx={{}}>
              {config.title}
            </Typography>
          </Stack>
        ),
        () => (
          <>
            <Handle
              type="target"
              position={Position.Left}
              id="in"
              key="in"
              style={{ top: ITEM_HEIGHT }}
            />
            <Handle
              type="target"
              position={Position.Right}
              id="out"
              key="out"
              style={{ top: ITEM_HEIGHT }}
            />
          </>
        ),
        ...map(config.vars, (varName) => (idy: number) => (
          // use TransformationMenu, should be var name on the left with transformation menu button on the right
          // dont use a handle, just text is fine
          <Stack
            key={varName}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ top: ITEM_HEIGHT * (idy + 0.5), px: 1, columnGap: 2 }}
          >
            <Typography variant="body2">{`${varName}: `} </Typography>
            <TransformationMenu variable={varName} />
          </Stack>
        )),
      ]}
    />
  );
}
