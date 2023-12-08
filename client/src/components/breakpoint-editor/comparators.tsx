import { Comparator } from "slices/UIState";

export const comparators: Comparator[] = [
  {
    key: "equal",
    apply: (a, b) => a === b,
    needsReference: true,
  },
  {
    key: "less-than",
    apply: (a, b) => a < b,
    needsReference: true,
  },
  {
    key: "greater-than",
    apply: (a, b) => a > b,
    needsReference: true,
  },
  {
    //find a unique next value (typically for f or g value)
    key: "changed",
    apply: (a, b) => a != b,
  },
];
