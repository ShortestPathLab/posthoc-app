import { computed, usePlaybackControls } from "hooks/usePlaybackState";
import { slice } from "slices";
import { StepsLayer } from "./StepsLayer";
import { useOne } from "slices/useOne";

export function useItemPlaybackState(layer?: string) {
  const one = slice.layers.one<StepsLayer>(layer);
  const playing = useOne(one, computed("playing"));

  const { stepTo } = usePlaybackControls(layer);
  return { stepTo, playing };
}
