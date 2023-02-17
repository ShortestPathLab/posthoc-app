import { clamp } from "lodash";
import { useMemo } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";

export function usePlaybackState() {
  const [{ eventList }] = useSpecimen();
  const [{ playback, step = 0 }, setUIState] = useUIState();

  const ready = !!eventList;
  const playing = playback === "playing";
  const [start, end] = [0, (eventList?.length ?? 1) - 1];

  return useMemo(() => {
    const state = {
      start,
      end,
      step,
      canPlay: ready && !playing && step < end,
      canPause: ready && playing,
      canStop: ready,
      canStepForward: ready && !playing && step < end,
      canStepBackward: ready && !playing && step > 0,
    };

    const stepBy = (n: number) => clamp(step + n, start, end);

    const callbacks = {
      play: () => setUIState({ playback: "playing", step: stepBy(1) }),
      pause: (n = 0) => setUIState({ playback: "paused", step: stepBy(n) }),
      stop: () => setUIState({ step: start, playback: "paused" }),
      stepForward: () => setUIState({ playback: "paused",step: stepBy(1) }),
      stepBackward: () => setUIState({ playback: "paused",step: stepBy(-1) }),
      tick: (n = 1) => setUIState({ playback: "playing", step: stepBy(n) }),
    };

    return {
      playing: playback === "playing",
      ...state,
      ...callbacks,
    };
  }, [end, playback, playing, ready, setUIState, start, step]);
}
