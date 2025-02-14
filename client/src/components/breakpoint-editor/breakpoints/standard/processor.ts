import { comparators } from "components/breakpoint-editor/comparators";
import { find, get, lowerCase as lower, startCase } from "lodash";
import { assert } from "utils/assert";
import { Fields } from "./Fields";
import { BreakpointProcessor } from "../Breakpoint";

export const processor: BreakpointProcessor<Fields> = async (
  data,
  trace,
  trees
): Promise<{ result: string; step: number }[]> => {
  const result: { result: string; step: number }[] = [];
  if (trace?.content?.events) {
    const {
      condition,
      eventType: type,
      property = "",
      reference = 0,
    } = data ?? {};

    assert(condition, "condition is required");
    const comparator = find(comparators, (c) => c.key === condition);
    assert(comparator, "unknown condition");
    for (const [index, event] of trace.content.events.entries()) {
      const isType = !type || type === event.type;
      const match = () =>
        comparator?.apply?.({
          type,
          event,
          property,
          value: get(event, property),
          reference,
          step: index,
          events: trace?.content?.events ?? [],
          node: trees[index],
        });

      if (isType && match()) {
        const needsReference = condition !== "changed";
        result.push({
          step: index,
          result: needsReference
            ? `${property} ${lower(startCase(condition))} ${reference}`
            : `${property} ${lower(startCase(condition))}`,
        });
      }
    }
  }
  return result;
};
