/* eslint-disable react/display-name */
import { Card, Checkbox, Stack, TextField, Typography } from "@mui/material";
import { NodeResizer, type Node, type NodeProps } from "@xyflow/react";
import { useSurface } from "components/generic/surface";
import * as React from "react";
import { Fragment, useCallback } from "react";
import { useAcrylic, usePaper } from "theme";

import { map } from "lodash-es";
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

const ITEM_HEIGHT = 56;
const MIN_WIDTH = 240;

export function ConfigurableNode(props: NodeProps<ConfigurableNode>) {
  const { config } = props.data;

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
    ...map(config.outputs, (labeledHandle, i) => (idy: number) => (
      <LabeledHandle
        {...labeledHandle}
        key={`out-${i}`}
        id={`out-${i}`}
        type="source"
        style={{ top: ITEM_HEIGHT * (idy + 0.5) }}
      />
    )),
    ...map(config.inputs, (labeledHandle, i) => (idy: number) => (
      <LabeledHandle
        {...labeledHandle}
        key={`in-${i}`}
        id={`in-${i}`}
        type="target"
        style={{ top: ITEM_HEIGHT * (idy + 0.5) }}
      />
    )),
    ...map(config.fields, (field, idx) => () => (
      <Fragment key={`field-${idx}`}>
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
      </Fragment>
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
