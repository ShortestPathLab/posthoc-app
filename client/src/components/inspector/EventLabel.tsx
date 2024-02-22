import { startCase } from "lodash";
import { TraceEvent } from "protocol/Trace";

export function EventLabel({ event }: { event?: TraceEvent }) {
  return startCase(`${event?.type ?? "unsupported"} ${event?.id ?? "-"}`);
}
