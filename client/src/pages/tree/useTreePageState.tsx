import { slice } from "slices";
import { equal } from "slices/selector";
import { UploadedTrace } from "slices/UIState";
import { TreeLayer } from "./TreeLayer";

export function useTreePageState(key?: string) {
  "use no memo";

  const one = slice.layers.one<TreeLayer>(key);
  const trace = one.use<UploadedTrace | undefined>(
    (l) => l?.source?.trace,
    equal("key"),
  );
  const step = one.use((l) => l?.source?.step);
  return { step, trace };
}
