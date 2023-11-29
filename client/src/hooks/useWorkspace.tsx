import { useSnackbar } from "components/generic/Snackbar";
import download from "downloadjs";
import { fileDialog as file } from "file-select-dialog";
import { find } from "lodash";
import { UIState, useUIState } from "slices/UIState";
import { formatByte, useBusyState } from "slices/busy";
import { Layers, useLayers } from "slices/layers";
import { generateUsername as id } from "unique-username-generator";
import {
  compressBinaryAsync as compress,
  decompressBinaryAsync as decompress,
  parseYamlAsync,
} from "workers/async";

const acceptedFormats = [`.workspace.yaml`, `.workspace.json`, `.workspace`];

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
            const content = isCompressedFile(f)
              ? await decompress(new Uint8Array(await f.arrayBuffer()))
              : await f.text();
            const parsed = (await parseYamlAsync(content)) as
              | Workspace
              | undefined;
            if (parsed) {
              setLayers(() => parsed.layers);
              setUIState(() => parsed.UIState);
            }
          }, `Opening workspace (${formatByte(f.size)})`);
        } else {
          notify(`${f?.name} is not a workspace file`);
        }
      }
    },
    save: async (raw?: boolean) => {
      notify("Saving workspace...");
      const content = JSON.stringify({ layers, UIState });
      if (raw) {
        const name = `${id("-")}.workspace.json`;
        download(content, name, "application/json");
        notify("Workspace saved", name);
      } else {
        const name = `${id("-")}.workspace`;
        download(await compress(content), name, "application/octet-stream");
        notify("Workspace saved", name);
      }
    },
  };
}

function isCompressedFile(f: File) {
  return f.name.endsWith(`.workspace`);
}

export function isWorkspaceFile(f: File) {
  return find(acceptedFormats, (format) => f.name.endsWith(format));
}
