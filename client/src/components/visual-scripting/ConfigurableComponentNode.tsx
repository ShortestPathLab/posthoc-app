/* eslint-disable react/display-name */
import { Stack, Typography } from "@mui/material";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import * as React from "react";

import { keys, map } from "es-toolkit/compat";
import TransformationMenu from "./TransformationMenu";
import { ItemOptions, NodeBase } from "./NodeBase";
import { FlowData, Properties } from "./flow";

export type ComponentNodeConfig = {
  title: string;
  vars: string[]; // list of variable names
};

type ConfigurableComponentNode = Node<FlowData<string, Properties>>;

const ITEM_HEIGHT = 56;

export function ConfigurableComponentNode(props: NodeProps<ConfigurableComponentNode>) {
  const { fields, type } = props.data;

  const config: ComponentNodeConfig = {
    title: type,
    vars: keys(fields),
  };

  return (
    <NodeBase
      items={[
        {
          height: ITEM_HEIGHT,
          render: () => (
            <Stack>
              <Typography key="title" variant="subtitle2" sx={{}}>
                {config.title}
              </Typography>
            </Stack>
          ),
        },
        {
          height: ITEM_HEIGHT,
          render: ({ y }: ItemOptions) => (
            <>
              <Handle type="target" position={Position.Left} id="in" key="in" style={{ top: y }} />
              <Handle
                type="target"
                position={Position.Right}
                id="out"
                key="out"
                style={{ top: y }}
              />
            </>
          ),
        },
        ...map(config.vars, (varName) => ({
          height: ITEM_HEIGHT,
          render: ({ y, height }: ItemOptions) => (
            // use TransformationMenu, should be var name on the left with transformation menu button on the right
            // dont use a handle, just text is fine
            <Stack
              key={varName}
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                top: y + height * 0.5,
                px: 1,
                columnGap: 2,
              }}
            >
              <Typography variant="body2">{`${varName}: `} </Typography>
              <TransformationMenu variable={varName} />
            </Stack>
          ),
        })),
      ]}
    />
  );
}
