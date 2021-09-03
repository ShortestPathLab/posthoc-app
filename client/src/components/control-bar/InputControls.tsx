import { Button, Typography as Type } from "@material-ui/core";
import { Select } from "components/Select";
import { Space } from "components/Space";
import { useCompatibilityLayer } from "hooks/useCompatibilityLayer";
import { find, map } from "lodash";
import { useFeatures } from "slices/features";
import { useUIState } from "slices/UIState";

function AlgorithmPicker() {
  const [{ algorithms }] = useFeatures();
  const [{ algorithm: value }, setUIState] = useUIState();
  const selected = find(algorithms, { id: value });
  return (
    <Select
      placeholder="Algorithm"
      trigger={(props) => (
        <Button {...props}>{selected?.name ?? "Choose Algorithm"}</Button>
      )}
      items={map(algorithms, ({ id, name }) => ({
        value: id,
        label: (
          <>
            <Type>{name}</Type>
            <Space />
            <Type variant="body2" color="textSecondary">
              {id}
            </Type>
          </>
        ),
      }))}
      value={selected?.id}
      onChange={(v) =>
        setUIState({ algorithm: v, step: 0, playback: "paused" })
      }
    />
  );
}

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
