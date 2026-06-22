import { comparators } from "components/breakpoint-editor/comparators";
import { lowerCase as lower } from "es-toolkit";
import { filter, find, get, map, startCase } from "es-toolkit/compat";
import { assert } from "utils/assert";
import { flow } from "utils/flow";
import { Fields } from "./Fields";
import { BreakpointProcessor } from "../Breakpoint";

export const processor: BreakpointProcessor<Fields> = async (
  data,
  trace,
  trees,
): Promise<{ result: string; step: number }[]> => {
  if (!trace?.content?.events) return [];

  const { condition, eventType: type, property = "", reference = 0 } = data ?? {};

  assert(condition, "condition is required");
  const comparator = find(comparators, (c) => c.key === condition);
  assert(comparator, "unknown condition");

  const label =
    condition !== "changed"
      ? `${property} ${lower(startCase(condition))} ${reference}`
      : `${property} ${lower(startCase(condition))}`;

  return flow(
    [...trace.content.events.entries()],
    (events) =>
      filter(
        events,
        ([index, event]) =>
          (!type || type === event.type) &&
          !!comparator?.apply?.({
            type,
            event,
            property,
            value: get(event, property),
            reference,
            step: index,
            events: trace?.content?.events ?? [],
            node: trees[index],
          }),
      ),
    (events) => map(events, ([index]) => ({ step: index, result: label })),
  );
};
