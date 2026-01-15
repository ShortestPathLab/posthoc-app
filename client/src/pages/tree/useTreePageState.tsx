import { slice } from "slices";
import { id } from "slices/selector";
import { useOne } from "slices/useOne";
import { TreeLayer } from "./TreeLayer";

export function useTreePageState(key?: string) {
  const one = slice.layers.one<TreeLayer>(key);
  const trace = useOne(one, (l) => l?.source?.trace, id("key"));
  const step = useOne(one, (l) => l?.source?.step);
  return { step, trace };
}
