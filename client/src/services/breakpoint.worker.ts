import type {
  BreakpointProcessor,
  BreakpointProcessorOutput,
} from "components/breakpoint-editor/breakpoints/Breakpoint";
import processors from "components/breakpoint-editor/breakpoints/processors";
import { assert } from "utils/assert";
import { usingMessageHandler } from "workers/usingWorker";
import type { BreakpointWorkerParameters } from "./BreakpointService";

async function run({
  breakpoint: { type, properties: inputs = {} },
  trace,
  dict,
}: BreakpointWorkerParameters): BreakpointProcessorOutput {
  assert(type, "type is defined");
  const processor = processors[type] as BreakpointProcessor<any>;
  return await processor(inputs, trace, dict);
}

onmessage = usingMessageHandler(
  async ({ data }: MessageEvent<any>) => await run(data)
);
