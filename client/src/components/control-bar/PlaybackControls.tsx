import {
  PauseOutlined,
  PlayArrowOutlined,
  SkipNextOutlined,
  SkipPreviousOutlined,
  StopOutlined,
} from "@material-ui/icons";
import { IconButtonWithTooltip as Button } from "components/IconButtonWithTooltip";
import { usePlaybackState } from "hooks/usePlaybackState";
import Controller from "old/controller";
import PlaybackService from "old/services/playback";

export function PlaybackControls() {
  const playbackState = usePlaybackState();
  const canStep = playbackState !== "none" && playbackState !== "running";
  return (
    <>
      <Button
        label="step-backward"
        icon={<SkipPreviousOutlined />}
        onClick={() => Controller.stepBackward()}
        disabled={!canStep}
      />
      <Button
        {...(playbackState === "running"
          ? {
              label: "pause",
              icon: <PauseOutlined />,
              onClick: () => PlaybackService.pause(),
            }
          : {
              label: "play",
              icon: <PlayArrowOutlined />,
              onClick: () => PlaybackService.play(),
              disabled: playbackState === "none",
              color: "primary",
            })}
      />
      <Button
        label="step-forward"
        icon={<SkipNextOutlined />}
        onClick={() => Controller.stepForward()}
        disabled={!canStep}
      />
      <Button
        label="stop"
        icon={<StopOutlined />}
        onClick={() => PlaybackService.reset()}
        disabled={playbackState === "none"}
      />
    </>
  );
}
