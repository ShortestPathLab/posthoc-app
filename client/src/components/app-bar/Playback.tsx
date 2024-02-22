import {
  ChevronRightOutlined as NextIcon,
  PauseOutlined as PauseIcon,
  PlayArrowOutlined as PlayIcon,
  ChevronLeftOutlined as PreviousIcon,
  SkipNextOutlined as SkipIcon,
  StopOutlined as StopIcon,
} from "@mui/icons-material";
import { EditorSetterProps } from "components/Editor";
import { IconButtonWithTooltip as Button } from "components/generic/IconButtonWithTooltip";
import { usePlaybackState } from "hooks/usePlaybackState";
import { ceil, noop } from "lodash";
import { useEffect } from "react";
import { Layer } from "slices/layers";
import { useSettings } from "slices/settings";

export type PlaybackLayerData = {
  step?: number;
  playback?: "playing" | "paused";
  playbackTo?: number;
};

const FRAME_TIME_MS = 1000 / 60;

export function PlaybackService({
  children,
  value,
}: EditorSetterProps<Layer<PlaybackLayerData>>) {
  const { step, end, playing, pause, stepWithBreakpointCheck } =
    usePlaybackState(value?.key);

  const [{ "playback/playbackRate": playbackRate = 1 }] = useSettings();

  useEffect(() => {
    if (playing) {
      let cancelled = false;
      let cancel = noop;
      let prev = Date.now();
      const f = () => {
        if (!cancelled) {
          const now = Date.now();
          const elapsed = ceil((playbackRate * (now - prev)) / FRAME_TIME_MS);
          if (step < end) {
            cancel = stepWithBreakpointCheck(elapsed);
            prev = now;
          } else {
            cancelled = true;
            pause();
          }
          requestAnimationFrame(f);
        }
      };
      requestAnimationFrame(f);
      return () => {
        cancel();
        cancelled = true;
      };
    }
  }, [stepWithBreakpointCheck, playing, end, step, pause, playbackRate]);

  return <>{children}</>;
}

export function Playback({ layer }: { layer?: Layer<PlaybackLayerData> }) {
  const {
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
    stepWithBreakpointCheck,
    step,
    end,
  } = usePlaybackState(layer?.key);
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
        icon={<NextIcon />}
        onClick={stepForward}
        disabled={!canStepForward}
      />
      <Button
        label="stop"
        icon={<StopIcon />}
        onClick={stop}
        disabled={!canStop}
      />
      <Button
        label="step-to-next-breakpoint"
        icon={<SkipIcon />}
        onClick={() => {
          stepWithBreakpointCheck(end - step, 1);
        }}
        disabled={!canStepForward}
      />
    </>
  );
}
