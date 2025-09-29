import { NodeConfig } from "./ConfigurableNode";
import { LabeledHandleProps } from "./LabeledHandle";

export const exampleMathNode: NodeConfig = {
  title: "Math Node",
  inputs: [
    { label: "Value A", description: "First number" },
    { label: "Value B", description: "Second number" },
  ] as LabeledHandleProps[],
  outputs: [
    { label: "Result", description: "The result" },
  ] as LabeledHandleProps[],
  fields: [
    // TODO: Make this a dropdown/add a select type
    { label: "Operation", type: "text", value: "add" },
    { label: "Factor", type: "number", value: 1 },
    { label: "Enabled", type: "checkbox", value: true },
  ],
  // TODO: Add logic, e.g what this node actually does, any validation etc
};
