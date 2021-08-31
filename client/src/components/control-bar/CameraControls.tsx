import { Button } from "@material-ui/core";
import { usePlaybackState } from "hooks/usePlaybackState";
import Controller from "old/controller";

export function CameraControls() {
  const ready = usePlaybackState() !== "none";
  return (
    <>
      <Button disabled={!ready} onClick={() => Controller.fitMap()}>
        Fit All
      </Button>
      <Button disabled={!ready} onClick={() => Controller.fitDebugger()}>
        Fit Trace
      </Button>
      <Button disabled={!ready} onClick={() => Controller.fitScale()}>
        100%
      </Button>
    </>
  );
}
