import {
  PauseOutlined as PauseIcon,
  PlayArrowOutlined as PlayIcon,
  SkipNextOutlined as ForwardIcon,
  SkipPreviousOutlined as PreviousIcon,
  StopOutlined as StopIcon,
} from "@material-ui/icons";
import { IconButtonWithTooltip as Button } from "components/generic/IconButtonWithTooltip";
import { usePlaybackState } from "hooks/usePlaybackState";

export function Playback() {
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
  } = usePlaybackState();
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
