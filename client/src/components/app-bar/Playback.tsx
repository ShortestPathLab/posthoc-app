import { range, trimEnd } from "lodash";
import { useRaf } from "react-use";
import { ReactNode, useCallback, useEffect } from "react";
import { IconButtonWithTooltip as Button } from "components/generic/IconButtonWithTooltip";
import { Label } from "components/generic/Label";
import { useSnackbar } from "components/generic/Snackbar";
import { useBreakpoints } from "hooks/useBreakpoints";
import { usePlaybackState } from "hooks/usePlaybackState";
import { useSettings } from "slices/settings";
import { Layer, UploadedTrace } from "slices/UIState";
import {
  SkipNextOutlined as ForwardIcon,
  PauseOutlined as PauseIcon,
  PlayArrowOutlined as PlayIcon,
  SkipPreviousOutlined as PreviousIcon,
  StopOutlined as StopIcon,
} from "@mui/icons-material";











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

export function Playback({
  layer,
}: {
  layer?: Layer<{ trace?: UploadedTrace }>;
}) {
  const {
    step,
    tick,
    end,
    playing,
    canPause,
    canPlay,
    canStepBackward,
    canStepForward,
    canStop,
    pause,
    play,
    stepBackward,
    stepForward,
    stop,
  } = usePlaybackState(layer);
  useRaf();

  const notify = useSnackbar();
  const [{ playbackRate = 1 }] = useSettings();
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
  return (
    <>
      <Button
        label="step-backward"
        icon={<PreviousIcon />}
        onClick={stepBackward}
        disabled={!canStepBackward}
      />
      <Button
        {...(playing
          ? {
              label: "pause",
              icon: <PauseIcon />,
              onClick: () => pause(),
              disabled: !canPause,
            }
          : {
              label: "play",
              icon: <PlayIcon />,
              onClick: () => play(),
              disabled: !canPlay,
              color: "primary",
            })}
      />
      <Button
        label="step-forward"
        icon={<ForwardIcon />}
        onClick={stepForward}
        disabled={!canStepForward}
      />
      <Button
        label="stop"
        icon={<StopIcon />}
        onClick={stop}
        disabled={!canStop}
      />
    </>
  );
}