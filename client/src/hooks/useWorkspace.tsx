import { useSnackbar } from "components/generic/Snackbar";
import download from "downloadjs";
import { fileDialog as file } from "file-select-dialog";
import { find } from "lodash";
import { UIState, useUIState } from "slices/UIState";
import { formatByte, useBusyState } from "slices/busy";
import { Layers, useLayers } from "slices/layers";
import { generateUsername as id } from "unique-username-generator";
import { parseYamlAsync } from "workers/async";

const acceptedFormats = [`.workspace.yaml`, `.workspace.json`];

type Workspace = {
  UIState: UIState;
  layers: Layers;
};

export function useWorkspace() {
  const notify = useSnackbar();
  const [layers, setLayers] = useLayers();
  const [UIState, setUIState] = useUIState();
  const usingBusyState = useBusyState("workspace");
  return {
    load: async (selectedFile?: File) => {
      const f =
        selectedFile ??
        (await file({
          accept: acceptedFormats,
          strict: true,
        }));
      if (f) {
        if (isWorkspaceFile(f)) {
          await usingBusyState(async () => {
            const content = await f.text();
            const parsed = (await parseYamlAsync(content)) as
              | Workspace
              | undefined;
            if (parsed) {
              setLayers(() => parsed.layers);
              setUIState(() => parsed.UIState);
            }
          }, `Opening workspace (${formatByte(f.size)})`);
        } else {
          notify(`${f?.name} is not a workspace file.`);
        }
      }
    },
    save: () => {
      download(
        JSON.stringify({ layers, UIState }),
        `${id("-")}.workspace.json`,
        "application/json"
      );
    },
  };
}

export function isWorkspaceFile(f: File) {
  return find(acceptedFormats, (format) => f.name.endsWith(format));
}
