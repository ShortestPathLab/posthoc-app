import { processor as breakpointProcessor } from "./standard/processor";
import { processor as monotonicityProcessor } from "./monotonicity/processor";
import { processor as parentProcessor } from "./parent/processor";

const processors = {
  breakpoint: breakpointProcessor,
  monotonicity: monotonicityProcessor,
  "valid-parent": parentProcessor,
} as const;

export default processors;
