import { PlaybackLayerData } from "components/app-bar/Playback";
import { useSnackbar } from "components/generic/Snackbar";
import { clamp, min, range, set, trimEnd } from "lodash";
import { useMemo } from "react";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { useBreakpoints } from "./useBreakpoints";

function cancellable<T = void>(f: () => Promise<T>, g: (result: T) => void) {
  let cancelled = false;
  requestAnimationFrame(async () => {
    const result = await f();
    if (!cancelled) g(result);
  });
  return () => {
    cancelled = true;
  };
}

export function usePlaybackState(key?: string) {
  const one = slice.layers.one<Layer<PlaybackLayerData>>(key);
  const source = one.use((l) => l?.source);
  const notify = useSnackbar();
  const shouldBreak = useBreakpoints(key);

  const { playback, playbackTo, step: _step = 0 } = source ?? {};

  const step = min([playbackTo, _step]) ?? 0;

  const ready = !!playbackTo;
  const playing = playback === "playing";
  const [start, end] = [0, (playbackTo ?? 1) - 1];

  return useMemo(() => {
    const setPlaybackState = (
      s: (a: Partial<PlaybackLayerData>) => Partial<PlaybackLayerData>
    ) => {
      one.set((l) => set(l, "source", { ...l.source, ...s(l.source ?? {}) }));
    };
    const state = {
      start,
      end,
      step,
      canPlay: ready && !playing && step < end,
      canPause: ready && playing,
      canStop: ready && step,
      canStepForward: ready && !playing && step < end,
      canStepBackward: ready && !playing && step > 0,
    };

    const stepBy = (step: number, n: number) =>
      clamp((min([playbackTo, step]) ?? 0) + n, start, end);

    const pause = (n = 0) => {
      setPlaybackState(({ step = 0 }) => ({
        playback: "paused",
        step: stepBy(step, n),
      }));
    };

    const tick = (n = 1) => {
      return setPlaybackState(({ step = 0 }) => ({
        playback: "playing",
        step: stepBy(step, n),
      }));
    };

    const stepWithBreakpointCheck = (count: number, offset: number = 0) =>
      cancellable(
        async () => {
          for (const i of range(offset, count)) {
            const r = shouldBreak(step + i);
            if (r.result || r.error) return { ...r, offset: i };
          }
          return { result: "", offset: 0, error: undefined };
        },
        ({ result, offset, error }) => {
          if (error) {
            notify(`${trimEnd(error, ".")}`, `Step ${step + offset}`);
            pause();
          } else if (result) {
            notify(`Breakpoint hit: ${result}`, `Step ${step + offset}`);
            pause(offset);
          } else tick(count);
        }
      );

    const findBreakpoint = (direction: 1 | -1 = 1) => {
      let i;
      for (i = step + direction; i <= end && i >= 0; i += direction) {
        if (shouldBreak(i)?.result) break;
      }
      return i;
    };

    const callbacks = {
      play: () => {
        // notify("Playback started");
        setPlaybackState(({ step = 0 }) => ({
          playback: "playing",
          step: stepBy(step, 1),
        }));
      },
      pause,
      stepTo: (n = 0) =>
        setPlaybackState(() => ({ step: clamp(n, start, end) })),
      stop: () => setPlaybackState(() => ({ step: start, playback: "paused" })),
      stepForward: () =>
        setPlaybackState(({ step = 0 }) => ({ step: stepBy(step, 1) })),
      stepBackward: () =>
        setPlaybackState(({ step = 0 }) => ({ step: stepBy(step, -1) })),
      tick,
      findBreakpoint,
      stepWithBreakpointCheck,
    };

    return {
      playing: playback === "playing",
      ...state,
      ...callbacks,
    };
  }, [end, playback, playbackTo, playing, ready, start, step, shouldBreak]);
}
