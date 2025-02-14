import { find, forEach, map } from "lodash";
import { TraceEvent } from "protocol";
import { BreakpointProcessor } from "../Breakpoint";
import { Fields } from "./Fields";

export const processor: BreakpointProcessor<Fields> = async (
  data,
  trace,
  trees
) => {
  const { property } = data;
  const propertyValue = property ?? "f";

  return new Promise((resolve) => {
    const violations: { step: number; result: string }[] = [];
    forEach(trace.content?.events, (cEvent, step) => {
      const cNode = find(trees[step].events, (e) => e.step === step);
      const node = trees[step];
      if (!cNode || !cNode.pId || !node.parent?.events) return;

      let closest = Infinity;

      let pEvent: {
        data: TraceEvent;
        step: number;
        pId: string | number | undefined | null;
        id: string | number | undefined | null;
      } = {} as any;

      if (cNode.pId != node.parent.id) {
        return;
      }

      map(node.parent.events, (e) => {
        const s = Math.abs(step - e.step);
        if (s < closest && step > e.step) {
          closest = s;
          pEvent = e;
        }
      });

      if (pEvent && pEvent.data?.[propertyValue] > cEvent?.[propertyValue]) {
        violations.push({
          step,
          result: `Monotonicity Violation(${propertyValue}): child node ${cEvent.id} ${propertyValue}-value ${cEvent[propertyValue]} is small than parent node ${pEvent.id}  ${propertyValue}-value ${pEvent.data[propertyValue]}`,
        });
      }
    });

    resolve(violations);
  });
};
