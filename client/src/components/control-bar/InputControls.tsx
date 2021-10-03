import { find } from "lodash";
import { useFeatures } from "slices/features";
import { useUIState } from "slices/UIState";
import { FeaturePicker } from "./FeaturePicker";

const mapDefaults = { start: undefined, end: undefined };

export function InputControls() {
  const [{ algorithms, maps }] = useFeatures();
  const [{ algorithm, map }, setUIState] = useUIState();
  return (
    <>
      <FeaturePicker
        label="map"
        value={map?.id}
        items={maps}
        onChange={(v) =>
          setUIState({ ...mapDefaults, map: find(maps, { id: v }) })
        }
      />
      <FeaturePicker
        label="algorithm"
        value={algorithm}
        items={algorithms}
        onChange={(v) => setUIState({ algorithm: v })}
      />
    </>
  );
}
