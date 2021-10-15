import { clamp, round } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";

const TARGET_FRAME_TIME = 1000 / 120;

function useFrameTime(playing: boolean, step: number) {
  const [startTime, setStartTime] = useState(0);
  const [startFrame, setStartFrame] = useState(0);

  useEffect(() => {
    if (playing) {
      const now = Date.now();
      if (!startTime) {
        setStartTime(now);
        setStartFrame(step);
      }
    } else setStartTime(0);
  }, [setStartTime, startTime, setStartFrame, startFrame, playing, step]);

  return useCallback(
    () =>
      playing
        ? round((Date.now() - startTime) / TARGET_FRAME_TIME + startFrame)
        : 0,
    [startTime, startFrame, playing]
  );
}

export function usePlaybackState() {
  const [{ specimen }] = useSpecimen();
  const [{ playback, step = 0 }, setUIState] = useUIState();

  const ready = !!specimen;
  const playing = playback === "playing";
  const [start, end] = [0, (specimen?.eventList?.length ?? 1) - 1];

  const tick = useFrameTime(playing, step);

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

    const stepTo = (n: number) => clamp(n, start, end);
    const stepBy = (n: number) => stepTo(step + n);

    const callbacks = {
      play: () => setUIState({ playback: "playing", step: stepBy(1) }),
      pause: () => setUIState({ playback: "paused" }),
      stop: () => setUIState({ step: start, playback: "paused" }),
      stepForward: () => setUIState({ step: stepBy(1) }),
      stepBackward: () => setUIState({ step: stepBy(-1) }),
      tick: () => {
        setUIState({ playback: "playing", step: stepTo(tick()) });
      },
    };

    return {
      playing: playback === "playing",
      ...state,
      ...callbacks,
    };
  }, [end, playback, playing, ready, tick, setUIState, start, step]);
}
