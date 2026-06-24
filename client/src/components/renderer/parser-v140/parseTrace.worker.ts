import { filter, get, map, values } from "es-toolkit/compat";
import { CompiledComponent } from "protocol";
import { ComponentEntry } from "renderer";
import {
  parse as parseFrames,
  ParseTraceWorkerParameters,
  ParseTraceWorkerReturnType,
} from "./ParseTraceSlaveWorker";

type C = CompiledComponent<string, Record<string, any>>;

const makeKey = (id: string | number = "", condition: string | number = "") =>
  `${id}::::${condition}`;

export const getPersistence = (c: C) =>
  !c.clear ? "persistent" : typeof c.clear === "string" ? "special" : "transient";

const isVisible = ({ component: c }: ComponentEntry) =>
  c && Object.hasOwn(c, "alpha") ? get(c, "alpha")! > 0 : true;

type Persistence = ReturnType<typeof getPersistence>;

/**
 * One-shot, single-threaded trace parse for the legacy/untrusted path. Generates
 * every event's components in-process (no nested worker) and folds the
 * sequential "special" stack to produce the final transient output. The client
 * leases this whole worker from the `trace-gen` lane.
 */
export function parseTrace({
  trace,
  context,
  view = "main",
}: ParseTraceWorkerParameters): ParseTraceWorkerReturnType {
  const outs = parseFrames({ trace, context, view });

  const stack: Record<string, ComponentEntry[]> = {};

  const out: {
    [K in Exclude<Persistence, "special">]: ComponentEntry[];
  }[] = [];
  for (const {
    event,
    components: { transient = [], special = [], persistent = [] },
  } of outs) {
    delete stack[makeKey(event.id, event.type)];
    transient.push(...values(stack).flat());
    for (const a of special) {
      const key = makeKey(event.id, get(a.component, "clear"));
      stack[key] = stack[key] ?? [];
      stack[key].push(a);
      transient.push(a);
    }
    out.push({ transient, persistent });
  }

  return {
    stepsPersistent: map(out, "persistent").map((c) => filter(c, isVisible)),
    stepsTransient: map(out, "transient").map((c) => filter(c, isVisible)),
  };
}
