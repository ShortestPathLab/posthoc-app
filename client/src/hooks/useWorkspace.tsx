import { useSnackbar } from "components/generic/Snackbar";
import download from "downloadjs";
import { fileDialog as file } from "file-select-dialog";
import { setLayerSource } from "layers/TrustedLayerData";
import { getController } from "layers/layerControllers";
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
        const handler = getController(l);
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

export const ORIGIN_FILESYSTEM = "internal://file-system";
export const ORIGIN_UNKNOWN = "unknown";

export function useWorkspace() {
  const notify = useSnackbar();
  const [layersStore, setLayers] = useLayers();
  const [UIStateStore, setUIState] = useUIState();
  const usingBusyState = useBusyState("workspace");
  return useMemo(() => {
    const pickFile = async (origin?: string) => {
      const f = await file({
        accept: acceptedFormats,
        strict: true,
      });
      return {
        f,
        origin,
      };
    };
    return {
      load: async (selectedFile?: File, origin2?: string) => {
        const { origin, f } = selectedFile
          ? { f: selectedFile, origin: origin2 }
          : await pickFile(origin2);

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
                setLayers(() => {
                  for (const l of parsed.layers?.layers ?? []) {
                    setLayerSource(l, origin);
                  }
                  return parsed.layers;
                });
                setUIState(() => parsed.UIState);
                setUIState(() => ({ isTrusted: false }));
              }
            }, `Opening workspace (${formatByte(f.size)})`);
            return true;
          }
        }
        return false;
      },
      save: async (raw?: boolean, name?: string) => {
        notify("Saving workspace...");
        const content = JSON.stringify(minimise(UIStateStore, layersStore));
        console.log(content);
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

      generateWorkspaceFile: async () => {
        const content = JSON.stringify(minimise(UIStateStore, layersStore));
        const layerData = JSON.stringify(layersStore);
        const layerDataBlob = new Blob([layerData], {
          type: "application/json",
        });
        const compressWithCompressionStream = (blob: Blob) => {
          const compressionStream = new CompressionStream("gzip");
          const readableStream = blob.stream().pipeThrough(compressionStream);

          return new Response(readableStream).blob();
        };

        return compressWithCompressionStream(layerDataBlob);
      },
      estimateWorkspaceSize: memo((raw?: boolean) => {
        const size = sizeOf(minimise(UIStateStore, layersStore));
        return size * (raw ? 1 : LZ_COMPRESSION_RATIO);
      }),
    };
  }, [layersStore, UIStateStore]);
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
