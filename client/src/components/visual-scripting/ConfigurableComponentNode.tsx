/* eslint-disable react/display-name */
import { Box, Card, Checkbox, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { Handle, NodeResizer, Position, type Node, type NodeProps } from "@xyflow/react";
import { useSurface } from "components/generic/surface";
import * as React from "react";
import { Fragment, useCallback, useState } from "react";
import { useAcrylic, usePaper } from "theme";

import { map } from "lodash-es";
import { LabeledHandle, LabeledHandleProps } from "./LabeledHandle";
import TransformationMenu from "./TransformationMenu";

// Optional: don’t shadow MUI’s Dialog type name
function SurfaceDialogStub() {
  return <div>Dialog</div>;
}

export type ComponentNodeConfig = {
  title: string;
  vars: string[]; // list of variable names
};

type ConfigurableComponentNode = Node<
  { config: ComponentNodeConfig },
  "config"
>;

const ITEM_HEIGHT = 56;
const MIN_WIDTH = 240;

export function ConfigurableComponentNode(
  props: NodeProps<ConfigurableComponentNode>
) {
  const { config } = props.data;
  
  const [mode, setMode] = useState<"flow" | "code">("code");
  const [textValues, setTextValues] = useState<Record<string, string>>({});

  const handleTextChange = (varName: string, value: string) => {
    setTextValues((prev) => ({ ...prev, [varName]: value }));
  };

  // If you use useSurface elsewhere, you can still keep it:
  const { open, dialog } = useSurface(SurfaceDialogStub, {
    title: "Event properties",
  });

  const acrylic = useAcrylic();
  const paper = usePaper();

  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
    // You can call a prop to update node data if you wired it up via onNodesChange
  }, []);

  const items = [
    () => (
      <Stack>
        <Typography key="title" variant="subtitle2" sx={{}}>
          {config.title}
        </Typography>
      </Stack>
    ),
    () => (
      <>
        <Handle type="target" position={Position.Left} id="in" key="in" style={{ top: ITEM_HEIGHT }} />
        <Handle type="target" position={Position.Right} id="out" key="out" style={{ top: ITEM_HEIGHT }} />
      </>
    ),
    () => (
      <FormControl className="nodrag">
        <InputLabel>Mode</InputLabel>
        <Select
          size="small"
          value={mode}
          label="Mode"
          onChange={(e) => setMode(e.target.value as "flow" | "code")}
          sx={{ width: 110 }}
        >
          <MenuItem value="flow">Flow</MenuItem>
          <MenuItem value="code">Code</MenuItem>
        </Select>
      </FormControl>
    ),
    ...map(config.vars, (varName, i) => (idy: number) => (
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
        
        <Stack direction="row" alignItems="center" spacing={1}>
          {mode === "flow" ? (
            <TransformationMenu variable={varName} />
          ) : (
            <TextField
              size="small"
              variant="outlined"
              label="expression"
              value={textValues[varName] ?? ""}
              onChange={(e) => handleTextChange(varName, e.target.value)}
              sx={{ width: 120 }}
            />
          )}
        </Stack>
      </Stack>
    )),
  ];

  return (
    <>
      <NodeResizer
        lineStyle={{ opacity: 0 }}
        handleStyle={{ opacity: 0 }}
        minWidth={MIN_WIDTH}
        minHeight={items.length * ITEM_HEIGHT}
      />
      <Card
        variant="outlined"
        sx={{
          ...acrylic,
          ...paper(),
          position: "relative",
          overflow: "visible", // so handles can poke out
          width: "100%",
          height: "100%",
          p: 0,
        }}
      >
        {items.map((f, i) => (
          <Stack
            key={i}
            direction="row"
            sx={{
              maxHeight: ITEM_HEIGHT,
              height: ITEM_HEIGHT,
              width: "100%",
              alignItems: "center",
              px: 2,
            }}
          >
            {f(i)}
          </Stack>
        ))}
      </Card>
    </>
  );
}
