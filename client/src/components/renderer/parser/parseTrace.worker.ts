import {
  parse,
  ParseTraceWorkerParameters,
  ParseTraceWorkerReturnType,
} from "./ParseTraceSlaveWorker";

/**
 * One-shot, single-threaded legacy trace parse. The persistent/transient split
 * here is non-sequential (driven by each component's `display`), so a single
 * full-range pass is all that's needed — no nested worker. The client leases
 * this worker from the `trace-gen` lane.
 */
export function parseTrace(params: ParseTraceWorkerParameters): ParseTraceWorkerReturnType {
  return parse(params);
}
