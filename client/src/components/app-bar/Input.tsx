import { FileOpenOutlined } from "@mui/icons-material";
import { Button } from "@mui/material";
import { find } from "lodash";
import { EditorProps } from "../Editor";
import { FeaturePicker } from "./FeaturePicker";
import { custom as customMap, uploadMap, uploadTrace } from "./upload";
import { useSnackbar } from "components/generic/Snackbar";
import { useConnections } from "slices/connections";
import { useFeatures } from "slices/features";
import { useLoadingState } from "slices/loading";
import { Map, UploadedTrace } from "slices/UIState";

export const mapDefaults = { start: undefined, end: undefined };

export function MapPicker({ onChange, value }: EditorProps<Map>) {
  const notify = useSnackbar();
  const usingLoadingState = useLoadingState("specimen");
  const [connections] = useConnections();
  const [{ maps, formats }] = useFeatures();
  return (
    <FeaturePicker
      showArrow
      icon={<FileOpenOutlined />}
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
                usingLoadingState(async () => {
                  notify("Reading map...");
                  onChange?.(await f());
                });
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
  const usingLoadingState = useLoadingState("specimen");
  return (
    <Button
      startIcon={<FileOpenOutlined />}
      onClick={async () => {
        try {
          const f = await uploadTrace();
          if (f)
            usingLoadingState(async () => {
              notify("Reading trace...");
              const g = await f();
              if (g) {
                onChange?.(g);
              }
            });
        } catch (e) {
          notify(`${e}`);
        }
      }}
    >
      {value?.id ? `Uploaded Trace - ${value.name}` : "Choose File"}
    </Button>
  );
}

// export function Input() {
//   const notify = useSnackbar();
//   const [connections] = useConnections();
//   const [{ algorithms, maps, formats }] = useFeatures();
//   const [{ algorithm, map, parameters }, setUIState] = useUIState();

//   return (
//     <>
//       <FeaturePicker
//         icon={<MapIcon />}
//         label="Map"
//         value={map?.id}
//         items={[
//           customTrace(parameters),
//           customMap(map),
//           ...maps.map((c) => ({
//             ...c,
//             description: find(connections, { url: c.source })?.name,
//           })),
//         ]}
//         onChange={async (v) => {
//           switch (v) {
//             case customMap().id:
//               try {
//                 const f = await uploadMap(formats);
//                 if (f) {
//                   setUIState({
//                     ...mapDefaults,
//                     map: f,
//                     algorithm: algorithm ?? "identity",
//                     parameters: {},
//                   });
//                   notify("Solution was cleared because the map changed.");
//                 }
//               } catch (e) {
//                 notify(`${e}`);
//               }
//               break;
//             case customTrace().id:
//               try {
//                 const f2 = await uploadTrace();
//                 if (f2) {
//                   setUIState({
//                     parameters: f2,
//                     algorithm: "identity",
//                     start: 0,
//                     end: 0,
//                     map: {
//                       format: f2.format,
//                       content: map?.format === f2.format ? map?.content : " ",
//                       id: "internal/upload",
//                     },
//                   });
//                 }
//               } catch (e) {
//                 notify(`${e}`);
//               }
//               break;
//             default:
//               setUIState({
//                 ...mapDefaults,
//                 map: find(maps, { id: v }),
//                 parameters: {},
//               });
//               notify("Solution was cleared because the map changed.");
//               break;
//           }
//         }}
//       />
//       <Space />
// <FeaturePicker
//   icon={<CodeIcon />}
//   label="Algorithm"
//   value={algorithm}
//   items={algorithms.map((c) => ({
//     ...c,
//     description: find(connections, { url: c.source })?.name,
//   }))}
//   onChange={async (v) => setUIState({ algorithm: v, parameters: {} })}
// />
//     </>
//   );
// }
