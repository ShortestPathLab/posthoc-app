import { Code as CodeIcon, MapTwoTone as MapIcon } from "@material-ui/icons";
import { useSnackbar } from "components/generic/Snackbar";
import { Space } from "components/generic/Space";
import { find } from "lodash";
import { useConnections } from "slices/connections";
import { useFeatures } from "slices/features";
import { useUIState } from "slices/UIState";
import { FeaturePicker } from "./FeaturePicker";
import { custom, upload } from "./upload";

export const mapDefaults = { start: undefined, end: undefined };

export function Select() {
  const notify = useSnackbar();
  const [connections] = useConnections();
  const [{ algorithms, maps, formats }] = useFeatures();
  const [{ algorithm, map }, setUIState] = useUIState();

  return (
    <>
      <FeaturePicker
        icon={<MapIcon />}
        label="map"
        value={map?.id}
        items={[
          custom(map),
          ...maps.map((c) => ({
            ...c,
            description: find(connections, { url: c.source })?.name,
          })),
        ]}
        onChange={async (v) => {
          switch (v) {
            case custom().id:
              try {
                const f = await upload(formats);
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
        items={algorithms.map((c) => ({
          ...c,
          description: find(connections, { url: c.source })?.name,
        }))}
        onChange={(v) => setUIState({ algorithm: v })}
      />
    </>
  );
}
