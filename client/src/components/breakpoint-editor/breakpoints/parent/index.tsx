import { BreakpointHandler } from "../Breakpoint";
import { Fields } from "./Fields";
import { processor } from "./processor";

export const validParentHandler: BreakpointHandler<"valid-parent", Fields> = {
  id: "valid-parent",
  name: "Valid parent",
  description: "Check if the parent of a node is previously seen",
  fields: [],
  processor,
};
