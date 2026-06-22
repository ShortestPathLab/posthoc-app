import { startCase } from "es-toolkit/compat";
import { TraceEvent } from "protocol/Trace";

export function EventLabel({ event }: { event?: TraceEvent }) {
  return startCase(`${event?.type ?? "event"} ${event?.id ?? "-"}`);
}
