import { Code as CodeIcon, MapTwoTone as MapIcon } from "@mui/icons-material";
import { useSnackbar } from "components/generic/Snackbar";
import { Space } from "components/generic/Space";
import { find } from "lodash";
import { Map, UploadedTrace, useUIState } from "slices/UIState";
import { useConnections } from "slices/connections";
import { useFeatures } from "slices/features";
import { EditorProps } from "../Editor";
import { FeaturePicker } from "./FeaturePicker";
import {
  custom as customMap,
  customTrace,
  uploadMap,
  uploadTrace,
} from "./upload";
import { Button } from "@mui/material";
import { Trace } from "protocol";

export const mapDefaults = { start: undefined, end: undefined };

export function MapPicker({ onChange, value }: EditorProps<Map>) {
  const notify = useSnackbar();
  const [connections] = useConnections();
  const [{ maps, formats }] = useFeatures();
  return (
    <FeaturePicker
      showArrow
      label="Choose Map"
      value={value?.id}
      items={[
        customMap(value),
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
                onChange?.(f);
              }
            } catch (e) {
              notify(`${e}`);
            }
            break;
          default:
            onChange?.(find(maps, { id: v })!);
            break;
        }
      }}
    />
  );
}

export function TracePicker({ onChange, value }: EditorProps<UploadedTrace>) {
  const notify = useSnackbar();
  const [connections] = useConnections();
  const [{ maps, formats }] = useFeatures();
  return (
    <Button
      variant="contained"
      onClick={async () => {
        try {
          const f = await uploadTrace();
          if (f) {
            onChange?.(f);
          }
        } catch (e) {
          notify(`${e}`);
        }
      }}
    >
      Upload Search Trace
    </Button>
  );
}

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
