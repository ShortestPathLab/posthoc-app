import {
  PauseOutlined,
  PlayArrowOutlined,
  SkipNextOutlined,
  SkipPreviousOutlined,
  StopOutlined,
} from "@material-ui/icons";
import { IconButtonWithTooltip as Button } from "components/IconButtonWithTooltip";
import { defer, delay, max, min } from "lodash";
import Controller from "old/controller";
import PlaybackService from "old/services/playback";
import { useEffect } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";

const PLAYBACK_RATE = 60;

export function PlaybackControls() {
  const [specimen] = useSpecimen();
  const [{ playback, step = 0 }, setUIState] = useUIState();
  const canStep = playback !== "playing";
  const maxStep = specimen?.eventList?.length ?? 0;
  useEffect(() => {
    if (playback === "playing") {
      if (maxStep > step) {
        const handle = delay(
          () => setUIState({ step: step + 1 }),
          1000 / PLAYBACK_RATE
        );
        return () => void clearTimeout(handle);
      } else {
        setUIState({ playback: "paused" });
      }
    }
  }, [playback, setUIState, step, specimen, maxStep]);
  return (
    <>
      <Button
        label="step-backward"
        icon={<SkipPreviousOutlined />}
        onClick={() => setUIState({ step: max([0, step - 1]) })}
        disabled={!specimen || !canStep}
      />
      <Button
        {...(playback === "playing"
          ? {
              label: "pause",
              icon: <PauseOutlined />,
              onClick: () => setUIState({ playback: "paused" }),
              disabled: !specimen,
            }
          : {
              label: "play",
              icon: <PlayArrowOutlined />,
              onClick: () => setUIState({ playback: "playing" }),
              disabled: !specimen,
              color: "primary",
            })}
      />
      <Button
        label="step-forward"
        icon={<SkipNextOutlined />}
        onClick={() => setUIState({ step: min([maxStep, step + 1]) })}
        disabled={!specimen || !canStep}
      />
      <Button
        label="stop"
        icon={<StopOutlined />}
        onClick={() => setUIState({ step: 0, playback: "paused" })}
        disabled={!specimen}
      />
    </>
  );
}
