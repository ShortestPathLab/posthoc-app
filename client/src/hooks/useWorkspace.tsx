import { useSnackbar } from "components/generic/Snackbar";
import download from "downloadjs";
import { fileDialog as file } from "file-select-dialog";
import { getLayerHandler } from "layers/layerHandlers";
import { find, pick } from "lodash";
import memo from "memoizee";
import sizeOf from "object-sizeof";
import { useMemo } from "react";
import { UIState, useUIState } from "slices/UIState";
import { formatByte, useBusyState } from "slices/busy";
import { Layers, useLayers } from "slices/layers";
import { generateUsername as id } from "unique-username-generator";
import {
  compressBinaryAsync as compress,
  decompressBinaryAsync as decompress,
  parseYamlAsync,
} from "workers/async";

const LZ_COMPRESSION_RATIO = 0.1 as const;

const acceptedFormats = [`.workspace.yaml`, `.workspace.json`, `.workspace`];

function byteLength(s: string) {
  return new TextEncoder().encode(s).length;
}

type Workspace = {
  UIState: UIState;
  layers: Layers;
};

const compressUIState = (state: UIState) => pick(state, "workspaceMeta");

function minimise(ui: UIState, layers: Layers) {
  return {
    UIState: compressUIState(ui),
    layers: {
      layers: layers?.layers?.map((l) => {
        const handler = getLayerHandler(l);
        return {
          ...l,
          source: {
            type: l.source?.type,
            ...handler?.compress?.(l.source),
          },
        };
      }),
    },
  };
}

export function useWorkspace() {
  const notify = useSnackbar();
  const [layers, setLayers] = useLayers();
  const [UIState, setUIState] = useUIState();
  const usingBusyState = useBusyState("workspace");
  return useMemo(
    () => ({
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
            return true;
          }
        }
        return false;
      },
      save: async (raw?: boolean, name?: string) => {
        notify("Saving workspace...");
        const content = JSON.stringify(minimise(UIState, layers));
        const filename = name ?? id("-");
        if (raw) {
          const name = `${filename}.workspace.json`;
          download(content, name, "application/json");
          notify("Workspace saved", name);
          return { name, size: byteLength(content) };
        } else {
          const name = `${filename}.workspace`;
          const compressed = await compress(content);
          download(compressed, name, "application/octet-stream");
          notify("Workspace saved", name);
          return { name, size: compressed.byteLength };
        }
      },
      estimateWorkspaceSize: memo((raw?: boolean) => {
        const size = sizeOf(minimise(UIState, layers));
        return size * (raw ? 1 : LZ_COMPRESSION_RATIO);
      }),
    }),
    [layers, UIState]
  );
}

function isCompressedFile(f: File) {
  return f.name.endsWith(`.workspace`);
}

export function isWorkspaceFile(f: File) {
  return !!find(acceptedFormats, (format) => f.name.endsWith(format));
}

export function isWorkspace(name: string) {
  return !!find(acceptedFormats, (format) => name.endsWith(format));
}
