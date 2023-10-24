import download from "downloadjs";
import { fileDialog as file } from "file-select-dialog";
import { UIState, useUIState } from "slices/UIState";
import { Layers, useLayers } from "slices/layers";
import { generateUsername as id } from "unique-username-generator";
import { parse } from "yaml";

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
  return {
    load: async () => {
      const f = await file({
        accept: FORMATS.map((c) => `.workspace.${c}`),
        strict: true,
      });
      if (f && FORMATS.includes(ext(f.name)!)) {
        const content = await f.text();
        const parsed = parse(content) as Workspace | undefined;
        if (parsed) {
          setLayers(() => parsed.layers);
          setUIState(() => parsed.UIState);
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
