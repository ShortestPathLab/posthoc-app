import { ceil, clamp, max } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";

const TARGET_FRAME_TIME = 1000 / 60;

function useFrameTime(playing: boolean) {
  const [lastFrame, setLastFrame] = useState(0);
  const [delta, setDelta] = useState(TARGET_FRAME_TIME);

  useEffect(() => {
    if (!playing) setLastFrame(0);
  }, [playing, setLastFrame]);

  const tick = useCallback(() => {
    if (playing) {
      const now = Date.now();
      if (lastFrame) {
        setDelta(now - lastFrame);
        setLastFrame(now);
      } else {
        setDelta(TARGET_FRAME_TIME);
        setLastFrame(now);
      }
    }
  }, [setDelta, setLastFrame, lastFrame, playing]);

  return [tick, delta, max([1, ceil(delta / TARGET_FRAME_TIME)]) ?? 1] as const;
}

export function usePlaybackState() {
  const [{ specimen }] = useSpecimen();
  const [{ playback, step = 0 }, setUIState] = useUIState();

  const ready = !!specimen;
  const playing = playback === "playing";
  const [start, end] = [0, (specimen?.eventList?.length ?? 1) - 1];

  const [tick, , lag] = useFrameTime(playing);

  return useMemo(() => {
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
      tick: () => {
        setUIState({ playback: "playing", step: stepBy(1 * lag) });
        tick();
      },
    };

    return {
      playing: playback === "playing",
      ...state,
      ...callbacks,
    };
  }, [end, lag, playback, playing, ready, tick, setUIState, start, step]);
}
