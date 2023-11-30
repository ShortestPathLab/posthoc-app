import { PlaybackLayerData } from "components/app-bar/Playback";
import { useSnackbar } from "components/generic/Snackbar";
import { clamp, min, set } from "lodash";
import { produce } from "produce";
import { useMemo } from "react";
import { useLayer } from "slices/layers";

export function usePlaybackState(key?: string) {
  const notify = useSnackbar();
  const { layer, setLayer } = useLayer<PlaybackLayerData>(key);

  const { playback, playbackTo, step: _step = 0 } = layer?.source ?? {};

  const step = min([playbackTo, _step]) ?? 0;

  const ready = !!playbackTo;
  const playing = playback === "playing";
  const [start, end] = [0, (playbackTo ?? 1) - 1];

  return useMemo(() => {
    function setPlaybackState(s: Partial<PlaybackLayerData>) {
      setLayer(
        produce(layer, (l) => set(l!, "source", { ...l?.source, ...s }))!
      );
    }
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
        // notify("Playback started");
        setPlaybackState({ playback: "playing", step: stepBy(1) });
      },
      pause: (n = 0) => {
        // notify("Playback paused");
        setPlaybackState({ playback: "paused", step: stepBy(n) });
      },
      stepTo: (n = 0) => setPlaybackState({ step: n }),
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
  }, [end, playback, playing, ready, start, step, setLayer]);
}
