import {
  PauseOutlined,
  PlayArrowOutlined,
  SkipNextOutlined,
  SkipPreviousOutlined,
  StopOutlined,
} from "@material-ui/icons";
import { IconButtonWithTooltip as Button } from "components/generic/IconButtonWithTooltip";
import { usePlaybackState } from "hooks/usePlaybackState";
import { PlaybackService } from "./PlaybackService";

export function PlaybackControls() {
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
      <PlaybackService />
      <Button
        label="step-backward"
        icon={<SkipPreviousOutlined />}
        onClick={stepBackward}
        disabled={!canStepBackward}
      />
      <Button
        {...(playing
          ? {
              label: "pause",
              icon: <PauseOutlined />,
              onClick: pause,
              disabled: !canPause,
            }
          : {
              label: "play",
              icon: <PlayArrowOutlined />,
              onClick: play,
              disabled: !canPlay,
              color: "primary",
            })}
      />
      <Button
        label="step-forward"
        icon={<SkipNextOutlined />}
        onClick={stepForward}
        disabled={!canStepForward}
      />
      <Button
        label="stop"
        icon={<StopOutlined />}
        onClick={stop}
        disabled={!canStop}
      />
    </>
  );
}
