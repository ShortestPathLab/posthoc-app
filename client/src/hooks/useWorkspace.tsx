import download from "downloadjs";
import { fileDialog as file } from "file-select-dialog";
import { UIState, useUIState } from "slices/UIState";
import { formatByte, useBusyState } from "slices/busy";
import { Layers, useLayers } from "slices/layers";
import { generateUsername as id } from "unique-username-generator";
import { parseYamlAsync } from "workers/async";

function ext(s: string) {
  return s.split(".").pop();
}
const FORMATS = ["json", "yaml"];

type Workspace = {
  UIState: UIState;
  layers: Layers;
};

export function useWorkspace() {
  const [layers, setLayers] = useLayers();
  const [UIState, setUIState] = useUIState();
  const usingBusyState = useBusyState("workspace");
  return {
    load: async () => {
      const f = await file({
        accept: FORMATS.map((c) => `.workspace.${c}`),
        strict: true,
      });
      if (f && FORMATS.includes(ext(f.name)!)) {
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
