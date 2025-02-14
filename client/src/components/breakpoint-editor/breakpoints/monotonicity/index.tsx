import { BreakpointHandler } from "../Breakpoint";
import { ConditionSelect, PropertiesSelect } from "../../fields";
import { Fields } from "./Fields";
import { processor } from "./processor";

export const monotonicityHandler: BreakpointHandler<"monotonicity", Fields> = {
  id: "monotonicity",
  name: "Monotonicity",
  description:
    "Check if the values of a property are strictly increasing or decreasing",
  fields: [
    { key: "property", component: <PropertiesSelect /> },
    {
      key: "condition",
      component: <ConditionSelect conditions={["increase"]} />,
    },
  ],
  processor,
};
