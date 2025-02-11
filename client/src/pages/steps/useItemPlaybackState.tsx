import { computed, usePlaybackControls } from "hooks/usePlaybackState";
import { slice } from "slices";
import { StepsLayer } from "./StepsLayer";

export function useItemPlaybackState(layer?: string) {
  "use no memo";
  const one = slice.layers.one<StepsLayer>(layer);
  const playing = one.use(computed("playing"));

  const { stepTo } = usePlaybackControls(layer);
  return { stepTo, playing };
}
