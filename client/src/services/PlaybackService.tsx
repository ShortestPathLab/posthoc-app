import {
  SnackbarLabel as Label,
  useSnackbar,
} from "components/generic/Snackbar";
import { usePlaybackState } from "hooks/usePlaybackState";
import { range, trimEnd } from "lodash";
import { ReactNode, useCallback, useEffect } from "react";
import { useRaf } from "react-use";
import { useBreakpoints } from "../hooks/useBreakpoints";

const RATE = 4;

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
              for (const i of range(RATE)) {
                const r = shouldBreak(step + i);
                if (r.result || r.error) return { ...r, offset: i };
              }
              return { result: "", offset: 0 };
            },
            ({ result, offset, error }) => {
              if (!error) {
                if (result) {
                  notify(renderLabel(`Breakpoint hit: ${result}.`, offset));
                  pause(offset);
                } else tick(RATE);
              } else {
                notify(renderLabel(`${trimEnd(error, ".")}.`, offset));
                pause();
              }
            }
          )
        : pause();
    }
  }, [renderLabel, playing, end, step, pause, tick, notify, shouldBreak]);

  return <></>;
}
