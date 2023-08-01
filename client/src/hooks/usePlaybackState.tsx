import { clamp } from "lodash";
import { useMemo } from "react";
import { useSpecimen } from "slices/specimen";
import { Layer, UploadedTrace, useUIState } from "slices/UIState";
import { useTraceContent } from "./useTraceContent";
import { usePlayback } from "slices/playback";
import { useSnackbar } from "components/generic/Snackbar";

export function usePlaybackState(layer?: Layer<{ trace?: UploadedTrace }>) {
  const notify = useSnackbar();
  const [{ playback, step = 0 }, setPlaybackState] = usePlayback();
  const { events } = useTraceContent(layer?.source?.trace?.content);

  const ready = !!events;
  const playing = playback === "playing";
  const [start, end] = [0, (events?.length ?? 1) - 1];

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
      play: () => {
        notify("Playback started");
        setPlaybackState({ playback: "playing", step: stepBy(1) });
      },
      pause: (n = 0) => {
        notify("Playback paused");
        setPlaybackState({ playback: "paused", step: stepBy(n) });
      },
      stop: () => setPlaybackState({ step: start, playback: "paused" }),
      stepForward: () => setPlaybackState({ step: stepBy(1) }),
      stepBackward: () => setPlaybackState({ step: stepBy(-1) }),
      tick: (n = 1) =>
        setPlaybackState({ playback: "playing", step: stepBy(n) }),
    };

    return {
      playing: playback === "playing",
      ...state,
      ...callbacks,
    };
  }, [end, playback, playing, ready, setPlaybackState, start, step]);
}
