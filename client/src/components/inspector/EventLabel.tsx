import { startCase } from "lodash-es";
import { TraceEvent } from "protocol/Trace";

export function EventLabel({ event }: { event?: TraceEvent }) {
  return startCase(`${event?.type ?? "event"} ${event?.id ?? "-"}`);
}
