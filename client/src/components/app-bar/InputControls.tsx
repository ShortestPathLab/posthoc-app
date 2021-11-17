import { useSnackbar } from "components/generic/Snackbar";
import { find } from "lodash";
import { useFeatures } from "slices/features";
import { useInfo } from "slices/info";
import { useUIState } from "slices/UIState";
import { custom, upload } from "./upload";
import { FeaturePicker } from "./FeaturePicker";
import { Code as CodeIcon, MapTwoTone as MapIcon } from "@material-ui/icons";
import { Space } from "components/generic/Space";

export const mapDefaults = { start: undefined, end: undefined };

export function InputControls() {
  const notify = useSnackbar();
  const [info] = useInfo();
  const [{ algorithms, maps, mapTypes: types }] = useFeatures();
  const [{ algorithm, map }, setUIState] = useUIState();

  return (
    <>
      <FeaturePicker
        icon={<MapIcon />}
        label="map"
        value={map?.id}
        items={[
          custom(map),
          ...maps.map((c) => ({ ...c, description: info?.name })),
        ]}
        onChange={async (v) => {
          switch (v) {
            case custom().id:
              try {
                const f = await upload(types);
                if (f) setUIState({ ...mapDefaults, map: f });
              } catch (e) {
                notify(`${e}`);
              }
              break;
            default:
              setUIState({ ...mapDefaults, map: find(maps, { id: v }) });
              break;
          }
        }}
      />
      <Space />
      <FeaturePicker
        icon={<CodeIcon />}
        label="algorithm"
        value={algorithm}
        items={algorithms}
        onChange={(v) => setUIState({ algorithm: v })}
      />
    </>
  );
}
