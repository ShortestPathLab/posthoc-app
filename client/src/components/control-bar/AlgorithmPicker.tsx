import { Button, Typography as Type } from "@material-ui/core";
import { Select } from "components/generic/Select";
import { Space } from "components/generic/Space";
import { find, map } from "lodash";
import { useFeatures } from "slices/features";
import { useUIState } from "slices/UIState";

export function AlgorithmPicker() {
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
