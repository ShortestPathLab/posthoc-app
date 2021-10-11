import {
  SnackbarLabel as Label,
  useSnackbar,
} from "components/generic/Snackbar";
import { usePlaybackState } from "hooks/usePlaybackState";
import { trimEnd } from "lodash";
import { ReactNode, useCallback, useEffect } from "react";
import { useBreakpoints } from "../hooks/useBreakpoints";

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
  const notify = useSnackbar();
  const { playing, end, step, pause, tick } = usePlaybackState();
  const shouldBreak = useBreakpoints();

  const renderLabel = useCallback(
    (label: ReactNode) => <Label primary={label} secondary={`Step ${step}`} />,
    [step]
  );

  useEffect(() => {
    if (playing) {
      return step < end
        ? cancellable(
            () => shouldBreak(step),
            ({ result, error }) => {
              if (!error) {
                if (result) {
                  notify(renderLabel(`Breakpoint hit: ${result}.`));
                  pause();
                } else tick();
              } else {
                notify(renderLabel(`${trimEnd(error, ".")}.`));
                pause();
              }
            }
          )
        : pause();
    }
  }, [renderLabel, playing, end, step, pause, tick, notify, shouldBreak]);

  return <></>;
}
