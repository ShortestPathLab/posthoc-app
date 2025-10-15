import { entries } from "lodash-es";
import {
  createFlowNodeDefinition,
  FlowData,
  Properties,
  TransformationNodeConfig,
} from "./flow";
import { GoToDefinitionButton } from "./GoToDefinitionButton";

export type MathData = FlowData<
  "math",
  {
    a: number;
    b: number;
    operation: "add" | "subtract" | "multiply" | "divide";
    factor: number;
    enabled: boolean;
  }
>;


export const math = createFlowNodeDefinition<MathData>(() => ({
  key: "math",
  title: "Math",
  group: "data-processing",
  description: "Basic math operations",
  inputs: [
    { key: "a", type: "number", label: "Value A", description: "First number" },
    {
      key: "b",
      type: "number",
      label: "Value B",
      description: "Second number",
    },
  ],
  outputs: [
    {
      key: "result",
      type: "number",
      label: "Result",
      description: "The result",
    },
  ],
  fields: [
    // TODO: Make this a dropdown/add a select type
    { key: "operation", label: "Operation", type: "text", value: "add" },
    { key: "factor", label: "Factor", type: "number", value: 1 },
    { key: "enabled", label: "Enabled", type: "checkbox", value: true },
  ],
  // TODO: Add logic, e.g what this node actually does, any validation etc
}));

export type ExpressionData = FlowData<
  "expression",
  { property: string; type: "string" | "number" | "boolean" | "any" }
>;

export const expression = createFlowNodeDefinition<ExpressionData>((v) => ({
  key: "expression",
  title: "Expression",
  group: "data-processing",
  description: "Evaluate an expression",
  inputs: [
    {
      key: "view",
      label: "Data",
      description: "The dataset to get the value from",
      type: "any",
    },
  ],
  outputs: [
    {
      key: "output",
      label: "Result",
      description: "The output value of the expression",
      type: v?.type ?? "any",
    },
  ],
  fields: [
    { key: "property", label: "Expression", type: "text", value: v?.property },
    {
      key: "type",
      label: "type",
      type: "select",
      value: v?.type ?? "any",
      options: ["string", "number", "boolean", "any"].map((t) => ({ label: t, value: t })),
    },
  ],
}));

export type ComponentData = FlowData<
  "component",
  {
    $?: string;
  } & Properties
>;

export type ContextData = FlowData<"context", never>;

export const context = createFlowNodeDefinition(() => ({
  key: "context",
  group: "inputs",
  title: "Context",
  description: "The data received from the parent view",
  outputs: [
    {
      key: "values",
      label: "Data",
      type: "any",
    },
  ],
}));

export type ViewportData = FlowData<"viewport", never>;

export const viewport = createFlowNodeDefinition(() => ({
  key: "viewport",
  group: "outputs",
  title: "Viewport",
  description: "Send views to the viewport",
  inputs: [
    {
      key: "components",
      label: "Views",
      type: "any",
    },
  ],
}));

export const component = createFlowNodeDefinition<ComponentData>(
  ({ $, ...rest } = {}) => ({
    key: "component",
    group: "hidden",
    title: $ ? (
      <>
        {`View (${$})`}
        <GoToDefinitionButton
          edge="end"
          sx={{
            ml: "auto",
          }}
          size="small"
          $={$}
        />
      </>
    ) : (
      "View"
    ),
    inputs: entries(rest).map(([key, value]) => ({
      key,
      label: key,
      type: "any",
      value,
    })),
    outputs: [
      {
        key: "result",
        label: "Views",
        description: "The output views",
        type: "any",
      },
    ],
    fields: [],
  })
);

export type LoopData = FlowData<
  "loop",
  {
    $i: string;
    $from: number;
    $to: number;
    $skip: number;
  }
>;

export const theme = createFlowNodeDefinition(() => ({
  key: "theme",
  group: "inputs",
  title: "Theme",
  description: "Get theme variables",
  inputs: [],
  outputs: [
    { key: "text", label: "Text color", type: "any" },
    {
      key: "accent",
      label: "Accent color",
      type: "any",
    },
    {
      key: "background",
      label: "Background color",
      type: "any",
    },
  ],
  fields: [],
}));

export const loop = createFlowNodeDefinition<LoopData>((v) => ({
  key: "loop",
  title: "For",
  description: "Iterate over a range",
  group: "iteration",
  inputs: [
    {
      key: "$i",
      label: "Variable name",
      type: "string",
      value: v?.$i ?? "i",
    },
    {
      key: "$from",
      label: "From",
      type: "number",
      value: v?.$from ?? 0,
    },
    {
      key: "$to",
      label: "To",
      type: "number",
      value: v?.$to ?? 0,
    },
    {
      key: "$skip",
      label: "Skip",
      type: "number",
      value: v?.$skip ?? 1,
    },
  ],
  outputs: [
    {
      key: "output",
      label: "Iterator",
      type: "any",
    },
  ],
  fields: [],
}));

export const loopIndex = createFlowNodeDefinition(() => ({
  key: "reflection",
  title: "Reflection",
  description: "Get information about the current rendering view",
  group: "advanced",
  inputs: [],
  outputs: [
    {
      key: "output",
      label: "Loop index",
      description: "The index of the current view",
      type: "number",
    },
  ],
  fields: [],
}));

export const transforms = {
  expression,
  context,
  viewport,
  math,
  theme,
  component,
  loop,
  loopIndex,
};

export function resolveNodeConfig(t: string) {
  return transforms[t as keyof typeof transforms] as (
    v?: Properties
  ) => TransformationNodeConfig<string, Properties> | undefined;
}
