import { useSnackbar } from "components/generic/Snackbar";
import { Label } from "components/generic/Label";
import { usePlaybackState } from "hooks/usePlaybackState";
import { range, trimEnd } from "lodash";
import { ReactNode, useCallback, useEffect } from "react";
import { useRaf } from "react-use";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useSettings } from "slices/settings";

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

export function PlaybackService() {
  useRaf();

  const notify = useSnackbar();
  const [{ playbackRate = 1 }] = useSettings();
  const { playing, end, step, pause, tick } = usePlaybackState();
  const shouldBreak = useBreakpoints();

  const renderLabel = useCallback(
    (label: ReactNode, offset: number) => (
      <Label primary={label} secondary={`Step ${step + offset}`} />
    ),
    [step]
  );

  useEffect(() => {
    if (playing) {
      return step < end
        ? cancellable(
            async () => {
              for (const i of range(playbackRate)) {
                const r = shouldBreak(step + i);
                if (r.result || r.error) return { ...r, offset: i };
              }
              return { result: "", offset: 0 };
            },
            ({ result, offset, error }) => {
              if (!error) {
                if (result) {
                  notify(`Breakpoint hit: ${result}.`, offset);
                  pause(offset);
                } else tick(playbackRate);
              } else {
                notify(`${trimEnd(error, ".")}.`, offset);
                pause();
              }
            }
          )
        : pause();
    }
  }, [
    renderLabel,
    playing,
    end,
    step,
    pause,
    tick,
    notify,
    shouldBreak,
    playbackRate,
  ]);

  return <></>;
}
