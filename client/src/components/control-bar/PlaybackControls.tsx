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

export function PlaybackControls() {
  const [specimen] = useSpecimen();
  const [{ playback, step = 0 }, setUIState] = useUIState();
  const canStep = playback !== "playing";
  const maxStep = (specimen?.eventList?.length ?? 1) - 1;
  useEffect(() => {
    if (playback === "playing") {
      if (maxStep > step) {
        const handle = requestAnimationFrame(() =>
          setUIState({ step: step + 1 })
        );
        return () => cancelAnimationFrame(handle);
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
