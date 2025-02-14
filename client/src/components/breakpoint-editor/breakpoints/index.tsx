import { breakpointHandler } from "./standard";
import { monotonicityHandler } from "./monotonicity";
import { validParentHandler } from "./parent";
import { BreakpointHandler } from "./Breakpoint";

const handlersCollection = {
  breakpoint: breakpointHandler,
  monotonicity: monotonicityHandler,
  "valid-parent": validParentHandler,
} as const;

export default handlersCollection satisfies {
  [K in keyof typeof handlersCollection]: BreakpointHandler<K, any>;
};
