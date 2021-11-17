import { Button } from "@material-ui/core";
import { useSpecimen } from "slices/specimen";

export function CameraControls() {
  const [{ specimen }] = useSpecimen();
  return (
    <>
      <Button disabled={!specimen}>Fit All</Button>
      <Button disabled={!specimen}>Fit Trace</Button>
      <Button disabled={!specimen}>100%</Button>
    </>
  );
}
