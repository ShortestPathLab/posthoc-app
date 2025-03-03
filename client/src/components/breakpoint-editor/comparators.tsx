import type { Comparator } from "hooks/Comparator";
import { findLast, get } from "lodash-es";

export const comparators: Comparator[] = [
  {
    key: "equal",
    apply: ({ value, reference }) => value === reference,
    needsReference: true,
  },
  {
    key: "less-than",
    apply: ({ value, reference }) => value < reference,
    needsReference: true,
  },
  {
    key: "greater-than",
    apply: ({ value, reference }) => value > reference,
    needsReference: true,
  },
  {
    //find a unique next value (typically for f or g value)
    key: "changed",
    apply: ({ value, property, step, node }) => {
      if (node.parent) {
        const previous = findLast(node.parent.events, (e) => e.step < step);
        if (previous) {
          return get(previous.data, property) !== value;
        }
      }
      return false;
    },
  },
];
