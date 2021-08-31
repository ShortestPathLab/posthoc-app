import { Button } from "@material-ui/core";
import { useCompatibilityLayer } from "hooks/useCompatibilityLayer";

export function InputControls() {
  const INTEROP_selectMap = useCompatibilityLayer("#map input");
  const INTEROP_selectAlgorithm = useCompatibilityLayer("#algorithm input");
  return (
    <>
      <Button onClick={INTEROP_selectMap}>Choose Map</Button>
      <Button onClick={INTEROP_selectAlgorithm}>Choose Algorithm</Button>
    </>
  );
}
