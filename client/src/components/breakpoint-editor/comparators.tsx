import { Comparator } from "slices/UIState";

export const comparators: Comparator[] = [
  {
    key: "equal",
    apply: (a, b) => a === b,
  },
  {
    key: "less-than",
    apply: (a, b) => a < b,
  },
  {
    key: "greater-than",
    apply: (a, b) => a > b,
  },
];