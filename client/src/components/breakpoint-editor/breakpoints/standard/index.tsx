import { map } from "lodash";
import { BreakpointHandler } from "../Breakpoint";
import { comparators } from "../../comparators";
import {
  ConditionSelect,
  EventSelect,
  PropertiesSelect,
  ReferenceInput,
} from "../../fields";
import { Fields } from "./Fields";
import { processor } from "./processor";

export const breakpointHandler: BreakpointHandler<"breakpoint", Fields> = {
  id: "breakpoint",
  name: "Standard breakpoint",
  description: "Check for classic conditions",
  fields: [
    { key: "eventType", component: <EventSelect /> },
    { key: "property", component: <PropertiesSelect /> },
    {
      key: "condition",
      component: (
        <ConditionSelect conditions={map(comparators, (v) => v.key)} />
      ),
    },
    { key: "reference", component: <ReferenceInput /> },
  ],
  processor,
};
