import { Button } from "@material-ui/core";
import Controller from "old/controller";
import { useSpecimen } from "slices/specimen";

export function CameraControls() {
  const [specimen] = useSpecimen();
  return (
    <>
      <Button disabled={!specimen} onClick={() => Controller.fitMap()}>
        Fit All
      </Button>
      <Button disabled={!specimen} onClick={() => Controller.fitDebugger()}>
        Fit Trace
      </Button>
      <Button disabled={!specimen} onClick={() => Controller.fitScale()}>
        100%
      </Button>
    </>
  );
}
