import { Button } from "@material-ui/core";
import { useCompatibilityLayer } from "hooks/useCompatibilityLayer";
import { AlgorithmPicker } from "./AlgorithmPicker";

function MapPicker() {
  const INTEROP_selectMap = useCompatibilityLayer("#map input");
  return <Button onClick={INTEROP_selectMap}>Choose Map</Button>;
}

export function InputControls() {
  return (
    <>
      <MapPicker />
      <AlgorithmPicker />
    </>
  );
}
