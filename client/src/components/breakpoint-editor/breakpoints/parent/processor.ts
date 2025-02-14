import { BreakpointProcessor } from "../Breakpoint";
import { Fields } from "./Fields";

// processor.ts
export const processor: BreakpointProcessor<Fields> = async (
  data,
  trace
): Promise<{ result: string; step: number }[] | { error: string }> => {
  const idSet = new Set();
  const violations: { step: number; result: string }[] = [];
  for (const [step, cEvent] of Object.entries(trace.content?.events ?? {})) {
    idSet.add(cEvent?.id);

    if (!cEvent.pId) continue;

    if (!idSet.has(cEvent.pId)) {
      violations.push({
        step: parseInt(step),
        result: `Valid Parent: child node ${cEvent.id}'s parent node ${cEvent.pId} is not previously seen`,
      });
    }
  }
  return violations;
};
