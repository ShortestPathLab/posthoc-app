import { isEqual } from "lodash-es";
import { layers } from "slices/layers";
import { useOne } from "slices/useOne";
import { TreeLayer } from "./TreeLayer";

export function useHighlighting(key?: string) {
  return useOne(
    layers.one<TreeLayer>(key),
    (l) => l.source?.highlighting,
    isEqual,
  );
}
