import { Steps } from "layers";
import { getController } from "layers/layerControllers";
import { slice } from "slices";
import { equal } from "slices/selector";
import { StepsLayer } from "./StepsLayer";
import { useBreakpoint3 } from "hooks/useBreakPoints";

export function useItemState({
  layer,
  index = 0,
}: {
  layer?: string;
  index?: number;
}) {
  "use no memo";
  const one = slice.layers.one<StepsLayer>(layer);
  const event = one.use<Steps | undefined>(
    (l) => getController(l)?.steps?.(l),
    equal("key")
  )?.steps?.[index];
  const isSelected = one.use((l) => l.source?.step === index);
  const { shouldBreak } = useBreakpoint3(layer);
  return { event, isSelected, label: shouldBreak(index)?.result };
}
