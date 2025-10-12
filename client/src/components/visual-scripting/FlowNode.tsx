/* eslint-disable react/display-name */
import { Checkbox, Stack, TextField, Typography } from "@mui/material";
import { type Node, type NodeProps } from "@xyflow/react";

import { isUndefined, map, sumBy } from "lodash-es";
import { FlowData, Properties, TransformationNodeConfig } from "./flow";
import { LabeledHandle } from "./LabeledHandle";
import { ItemOptions, NodeBase } from "./NodeBase";
import { resolveNodeConfig } from "./NodeConfigs";

export function FlowNode(props: NodeProps<Node<FlowData<string, Properties>>>) {
  const { fields, key, type } = props.data;

  const config = resolveNodeConfig(type)(fields as any);

  return <NodeBase items={getItems(config)} />;
}

export function getHeight(
  config?: TransformationNodeConfig<string, Properties>
) {
  return sumBy(getItems(config), (item) => item.height);
}

function getItems(config?: TransformationNodeConfig<string, Properties>) {
  return [
    {
      height: 48,
      render: () => (
        <Typography
          key="title"
          variant="subtitle2"
          sx={{ width: "100%", display: "flex", alignItems: "center" }}
        >
          {config?.title}
        </Typography>
      ),
    },
    ...map(config?.inputs, (item) => ({
      height: isUndefined(item.value) ? 48 : 56,
      render: ({ y, height }: ItemOptions) => (
        <LabeledHandle
          {...item}
          value={item.value}
          key={item.key}
          id={item.key}
          type="target"
          style={{ top: y + height * 0.5 }}
        />
      ),
    })),
    ...map(config?.outputs, (item) => ({
      height: 48,
      render: ({ y, height }: ItemOptions) => (
        <LabeledHandle
          {...item}
          key={item.key}
          id={item.key}
          type="source"
          style={{ top: y + height * 0.5 }}
        />
      ),
    })),
    ...map(config?.fields, (field, i, xs) => ({
      height: i === xs.length - 1 ? 56 + 16 : 56,
      render: () => (
        <Stack
          key={field.key}
          sx={{
            width: "100%",
            pb: i === xs.length - 1 ? 2 : 0,
          }}
        >
          {
            {
              text: () => (
                <TextField
                  size="small"
                  variant="filled"
                  label={field.label}
                  defaultValue={field.value}
                  fullWidth
                />
              ),
              number: () => (
                <TextField
                  type="number"
                  size="small"
                  variant="filled"
                  label={field.label}
                  defaultValue={field.value}
                  fullWidth
                />
              ),
              checkbox: () => (
                <Stack flexDirection="row" sx={{ gap: 1 }}>
                  <Checkbox
                    defaultChecked={field.value}
                    size="small"
                    sx={{
                      p: 0,
                    }}
                  />
                  <Typography variant="body2">{field.label}</Typography>
                </Stack>
              ),
            }[field.type]() /* lookup the right renderer based on field.type */
          }
        </Stack>
      ),
    })),
  ];
}
