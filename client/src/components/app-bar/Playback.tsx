import {
  ChevronLeftOutlined as PreviousIcon,
  ChevronRightOutlined as NextIcon,
  SkipNextOutlined as SkipIcon,
  PauseOutlined as PauseIcon,
  PlayArrowOutlined as PlayIcon,
  StopOutlined as StopIcon,
} from "@mui/icons-material";
import { EditorSetterProps } from "components/Editor";
import { IconButtonWithTooltip as Button } from "components/generic/IconButtonWithTooltip";
import { usePlaybackState } from "hooks/usePlaybackState";
import { noop } from "lodash";
import { useEffect } from "react";
import { UploadedTrace } from "slices/UIState";
import { Layer } from "slices/layers";
import { useSettings } from "slices/settings";

export type PlaybackLayerData = {
  step?: number;
  playback?: "playing" | "paused";
  playbackTo?: number;
};

export function PlaybackService({
  children,
  value,
}: EditorSetterProps<Layer<PlaybackLayerData>>) {
  const { step, end, playing, pause, stepWithBreakpointCheck } =
    usePlaybackState(value?.key);

  const [{ "playback/playbackRate": playbackRate = 1 }] = useSettings();

  useEffect(() => {
    if (playing) {
      let cancel = noop;
      const r = setInterval(() => {
        if (step < end) {
          cancel = stepWithBreakpointCheck(playbackRate);
        } else {
          pause();
        }
      }, 1000 / 60);
      return () => {
        cancel();
        clearInterval(r);
      };
    }
  }, [stepWithBreakpointCheck, playing, end, step, pause, playbackRate]);

  return <>{children}</>;
}

export function Playback({
  layer,
}: {
  layer?: Layer<{ trace?: UploadedTrace }>;
}) {
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
        label="step-to-next-breakpoint"
        icon={<SkipIcon />}
        onClick={() => {
          stepWithBreakpointCheck(end - step, 1);
        }}
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
