import { useSnackbar } from "components/generic/Snackbar";
import download from "downloadjs";
import { fileDialog as file } from "file-select-dialog";
import { setLayerSource } from "layers/TrustedLayerData";
import { getController } from "layers/layerControllers";
import { find, map } from "lodash-es";
import memo from "memoizee";
import sizeOf from "object-sizeof";
import { useMemo } from "react";
import { slice } from "slices";
import { workspaceMeta, WorkspaceMeta } from "slices/UIState";
import { formatByte, useBusyState } from "slices/busy";
import { Layer, layers } from "slices/layers";
import { generateUsername as id } from "unique-username-generator";
import { cast } from "utils/assert";
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
  UIState: {
    workspaceMeta: WorkspaceMeta;
  };
  layers: { layers: Layer[] };
};

function minimise(meta: WorkspaceMeta, layers: Layer[]): Workspace {
  return {
    UIState: { workspaceMeta: meta },
    layers: {
      layers: map(layers, (l) => {
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
    const generateFile = async (raw?: boolean, name?: string) => {
      notify("Saving workspace...");
      const content = JSON.stringify(
        minimise(workspaceMeta.get(), slice.layers.get())
      );
      const filename = name ?? id("-");
      if (raw) {
        const name = `${filename}.workspace.json`;
        notify("Workspace saved", name);
        return {
          name,
          content,
          size: byteLength(content),
          type: "application/json",
        };
      } else {
        const name = `${filename}.workspace`;
        const compressed = await compress(content);
        notify("Workspace saved", name);
        return {
          name,
          content:compressed as Uint8Array<ArrayBuffer>,
          size: compressed.byteLength,
          type: "application/octet-stream",
        };
      }
    };
    return {
      load: async (selectedFile?: File, origin2?: string) => {
        const { origin, f } = selectedFile
          ? { f: selectedFile, origin: origin2 }
          : await pickFile(origin2);

        if (f && isWorkspaceFile(f)) {
          await usingBusyState(
            async () => {
              const stream = f.stream();
              const content = isCompressedFile(f)
                ? await decompress(stream, [stream])
                : await f.text();
              const { result: parsed, error } = await parseYamlAsync({
                content,
              });
              if (error) throw error;
              cast<Workspace | undefined>(parsed);
              if (!parsed) return;
              for (const l of parsed?.layers?.layers ?? [])
                setLayerSource(l, origin);
              slice.layers.set(parsed?.layers.layers);
              workspaceMeta.set(parsed?.UIState?.workspaceMeta ?? {});
              slice.ui.isTrusted.set(false);
            },
            `Opening workspace (${formatByte(f.size)})`
          );
          return true;
        }
        return false;
      },
      save: async (raw?: boolean, name?: string) => {
        const {
          content,
          size,
          type,
          name: filename,
        } = await generateFile(raw, name);
        download(content, filename, type);
        return { name, size };
      },
      generateWorkspaceFile: async (suggestedName?: string) => {
        const { content, name, type } = await generateFile(
          false,
          suggestedName
        );
        return { file: new File([new Blob([content])], name, { type }) };
      },
      estimateWorkspaceSize: memo((raw?: boolean) => {
        const size = sizeOf(minimise(workspaceMeta.get(), slice.layers.get()));
        return size * (raw ? 1 : LZ_COMPRESSION_RATIO);
      }),
    };
  }, [layers]);
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
