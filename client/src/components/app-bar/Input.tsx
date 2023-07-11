import { Code as CodeIcon, MapTwoTone as MapIcon } from "@mui/icons-material";
import { useSnackbar } from "components/generic/Snackbar";
import { Space } from "components/generic/Space";
import { find, merge } from "lodash";
import { useUIState } from "slices/UIState";
import { useConnections } from "slices/connections";
import { useFeatures } from "slices/features";
import { FeaturePicker } from "./FeaturePicker";
import {
  custom as customMap,
  customTrace,
  uploadMap,
  uploadTrace,
} from "./upload";

export const mapDefaults = { start: undefined, end: undefined };

export function Input() {
  const notify = useSnackbar();
  const [connections] = useConnections();
  const [{ algorithms, maps, formats }] = useFeatures();
  const [{ algorithm, map, parameters }, setUIState] = useUIState();

  return (
    <>
      <FeaturePicker
        icon={<MapIcon />}
        label="Map"
        value={map?.id}
        items={[
          customTrace(parameters),
          customMap(map),
          ...maps.map((c) => ({
            ...c,
            description: find(connections, { url: c.source })?.name,
          })),
        ]}
        onChange={async (v) => {
          switch (v) {
            case customMap().id:
              try {
                const f = await uploadMap(formats);
                if (f) {
                  setUIState({
                    ...mapDefaults,
                    map: f,
                    algorithm: algorithm ?? "identity",
                    parameters: {},
                  });
                  notify("Solution was cleared because the map changed.");
                }
              } catch (e) {
                notify(`${e}`);
              }
              break;
            case customTrace().id:
              try {
                const f2 = await uploadTrace();
                if (f2) {
                  setUIState({
                    parameters: f2,
                    algorithm: "identity",
                    start: 0,
                    end: 0,
                    map: {
                      format: f2.format,
                      content: map?.format === f2.format ? map?.content : " ",
                      id: "internal/upload",
                    },
                  });
                }
              } catch (e) {
                notify(`${e}`);
              }
              break;
            default:
              setUIState({
                ...mapDefaults,
                map: find(maps, { id: v }),
                parameters: {},
              });
              notify("Solution was cleared because the map changed.");
              break;
          }
        }}
      />
      <Space />
      <FeaturePicker
        icon={<CodeIcon />}
        label="Algorithm"
        value={algorithm}
        items={algorithms.map((c) => ({
          ...c,
          description: find(connections, { url: c.source })?.name,
        }))}
        onChange={async (v) => setUIState({ algorithm: v, parameters: {} })}
      />
    </>
  );
}
