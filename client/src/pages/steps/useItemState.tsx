import { Steps } from "layers";
import { getController } from "layers/layerControllers";
import { slice } from "slices";
import { id } from "slices/selector";
import { StepsLayer } from "./StepsLayer";
import { useBreakpoint3 } from "hooks/useBreakPoints";
import { useOne } from "slices/useOne";

export function useItemState({
  layer,
  index = 0,
}: {
  layer?: string;
  index?: number;
}) {
  const one = slice.layers.one<StepsLayer>(layer);
  const event = useOne(
    one,
    (l) => getController(l)?.steps?.(l),
    id<Steps | undefined>("key"),
  )?.steps?.[index];
  const isSelected = useOne(one, (l) => l.source?.step === index);
  const { shouldBreak } = useBreakpoint3(layer);
  return { event, isSelected, label: shouldBreak(index)?.result };
}
