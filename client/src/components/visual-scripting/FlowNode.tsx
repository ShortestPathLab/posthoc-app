/* eslint-disable react/display-name */
import {
  Checkbox,
  FormControl,
  Select,
  Stack,
  TextField,
  Typography,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";

import { isUndefined, map, sumBy } from "lodash-es";
import { FlowData, Properties, TransformationNodeConfig } from "./flow";
import { LabeledHandle } from "./LabeledHandle";
import { ItemOptions, NodeBase } from "./NodeBase";
import { resolveNodeConfig } from "./NodeConfigs";

export function FlowNode(props: NodeProps<Node<FlowData<string, Properties>>>) {
  const { fields, key, type } = props.data;

  const { id, data } = props;

  const rf = useReactFlow();

  const updateField = (key: string, value: any) => {
    rf.setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                fields: {
                  ...(n.data?.fields ?? {}),
                  [key]: value,
                },
              },
            }
          : n,
      ),
    );
  };

  const config = resolveNodeConfig(type)?.(fields as any);

  return <NodeBase items={getItems(config, updateField)} />;
}

export function getHeight(
  config?: TransformationNodeConfig<string, Properties>,
) {
  return sumBy(getItems(config), (item) => item.height);
}

function getItems(
  config?: TransformationNodeConfig<string, Properties>,
  updateField?: (key: string, value: any) => void,
) {
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
          key={item.key}
          {...item}
          value={item.value}
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
          key={item.key}
          {...item}
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
              select: () => (
                <TextField
                  className="nodrag nowheel"
                  select
                  variant="filled"
                  labelId={`select-${field.key}`}
                  label={field.label}
                  value={field.value ?? ""}
                  fullWidth
                  onChange={(e) =>
                    updateField?.(String(field.key), e.target.value)
                  }
                >
                  {field.options?.length ? (
                    field.options.map((opt) => (
                      <MenuItem key={String(opt.value)} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No options</MenuItem>
                  )}
                </TextField>
              ),
            }[field.type]() /* lookup the right renderer based on field.type */
          }
        </Stack>
      ),
    })),
  ];
}
