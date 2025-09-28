import { Position } from "@xyflow/react";
import { NodeConfig } from "./ConfigurableNode";
import { LabeledHandleProps } from "./LabeledHandle";

export const exampleMathNode: NodeConfig = {
  title: "Math Node",
  inputs: [
    { label: "A" },
    { label: "B" },
  ] as LabeledHandleProps[],
  outputs: [
    { label: "Result" },
  ] as LabeledHandleProps[],
  fields: [
    { label: "Operation", type: "text", value: "add" },
    { label: "Factor", type: "number", value: 1 },
    { label: "Enabled", type: "checkbox", value: true },
  ],
};