import { clamp } from "lodash";
import { useMemo } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";

export function usePlaybackState() {
  const [specimen] = useSpecimen();
  const [{ playback, step = 0 }, setUIState] = useUIState();

  return useMemo(() => {
    const ready = !!specimen;
    const playing = playback === "playing";
    const [start, end] = [0, (specimen?.eventList?.length ?? 1) - 1];

    const state = {
      start,
      end,
      step,
      canPlay: ready && !playing,
      canPause: ready && playing,
      canStop: ready,
      canStepForward: ready && !playing && step < end,
      canStepBackward: ready && !playing && step > 0,
    };

    const stepBy = (n: number) => clamp(step + n, start, end);

    const callbacks = {
      play: () => setUIState({ playback: "playing", step: stepBy(1) }),
      pause: () => setUIState({ playback: "paused" }),
      stop: () => setUIState({ step: start, playback: "paused" }),
      stepForward: () => setUIState({ step: stepBy(1) }),
      stepBackward: () => setUIState({ step: stepBy(-1) }),
    };

    return {
      playing: playback === "playing",
      ...state,
      ...callbacks,
    };
  }, [specimen, playback, step, setUIState]);
}
