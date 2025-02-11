import { PlaybackLayerData } from "components/app-bar/Playback";
import { useSnackbar } from "components/generic/Snackbar";
import { clamp, min, range, trimEnd } from "lodash";
import { useMemo } from "react";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { set } from "utils/set";
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

const stepBy = (l: Layer<PlaybackLayerData>, n: number) => {
  const { playbackTo, step = 0 } = l?.source ?? {};
  const [start, end] = [0, (l?.source?.playbackTo ?? 1) - 1];
  set(
    l,
    "source.step",
    clamp((min([playbackTo ?? 0, step]) ?? 0) + n, start, end)
  );
};

type ComputedPlaybackLayerProperties = {
  start: number;
  end: number;
  step: number;
  canPlay: boolean;
  canPause: boolean;
  canStop: boolean;
  canStepForward: boolean;
  canStepBackward: boolean;
  playing: boolean;
};

export function computed<T extends keyof ComputedPlaybackLayerProperties>(
  k: T
) {
  return (l?: Layer<PlaybackLayerData>) => {
    const { playback, playbackTo, step: _step } = l?.source ?? {};

    const step = min([playbackTo, _step]) ?? 0;

    const ready = !!playbackTo;
    const playing = playback === "playing";
    const [start, end] = [0, (playbackTo ?? 1) - 1];

    return {
      start,
      end,
      step,
      canPlay: ready && !playing && step < end,
      canPause: ready && playing,
      canStop: ready && step,
      canStepForward: ready && !playing && step < end,
      canStepBackward: ready && !playing && step > 0,
      playing: playback === "playing",
    }[k];
  };
}

export function usePlaybackControls(key?: string) {
  "use no memo";

  const notify = useSnackbar();
  const shouldBreak = useBreakpoints(key);

  return useMemo(() => {
    const one = slice.layers.one<Layer<PlaybackLayerData>>(key);

    function get<T extends keyof PlaybackLayerData>(
      key: T,
      fallback: PlaybackLayerData[T]
    ) {
      return (one.get((l) => l.source?.[key]) ?? fallback)!;
    }

    const pause = (n = 0) =>
      one.set((l) => {
        set(l, "source.playback", "paused");
        stepBy(l, n);
      });

    const tick = (n = 1) =>
      one.set((l) => {
        set(l, "source.playback", "playing");
        stepBy(l, n);
      });

    return {
      play: () =>
        one.set((l) => {
          set(l, "source.playback", "playing");
          stepBy(l, 1);
        }),
      pause,
      stepTo: (n = 0) =>
        one.set((l) => {
          set(l, "source.step", clamp(n, 0, get("playbackTo", 1) - 1));
        }),
      stop: () =>
        one.set((l) => {
          set(l, "source.step", 0);
          set(l, "source.playback", "paused");
        }),
      stepForward: () => one.set((l) => stepBy(l, 1)),
      stepBackward: () => one.set((l) => stepBy(l, -1)),
      tick,
      findBreakpoint: (direction: 1 | -1 = 1) => {
        const step = one.get((l) => l.source?.step) ?? 0;
        const end = get("playbackTo", 1) - 1;
        let i;
        for (i = step + direction; i <= end && i >= 0; i += direction) {
          if (shouldBreak(i)?.result) break;
        }
        return i;
      },
      stepWithBreakpointCheck: (count: number, offset: number = 0) =>
        cancellable(
          async () => {
            for (const i of range(offset, count)) {
              const r = shouldBreak(get("step", 0) + i);
              if (r.result || r.error) return { ...r, offset: i };
            }
            return { result: "", offset: 0, error: undefined };
          },
          ({ result, offset, error }) => {
            if (error) {
              notify(
                `${trimEnd(error, ".")}`,
                `Step ${get("step", 0) + offset}`
              );
              pause();
            } else if (result) {
              notify(
                `Breakpoint hit: ${result}`,
                `Step ${get("step", 0) + offset}`
              );
              pause(offset);
            } else tick(count);
          }
        ),
    };
  }, [key, shouldBreak]);
}
