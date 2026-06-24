import { isEqual } from "es-toolkit";
import { useBreakpoint } from "hooks/useBreakPoints";
import { getController } from "layers/layerControllers";
import { slice } from "slices";
import { useOne } from "slices/useOne";
import { StepsLayer } from "./StepsLayer";

export function useItemState({ layer, index: indexProp }: { layer?: string; index?: number }) {
  // Default moved out of the destructure to avoid a React Compiler bailout.
  const index = indexProp ?? 0;
  const one = slice.layers.one<StepsLayer>(layer);
  const event = useOne(one, (l) => getController(l)?.steps?.(l)?.steps?.[index], isEqual)
  const isSelected = useOne(one, (l) => l.source?.step === index);
  const { shouldBreak } = useBreakpoint(layer);
  return { event, isSelected, label: shouldBreak(index)?.result };
}
