import { WorkspacesOutlined } from "@mui/icons-material";
import { Backdrop, Stack, Typography as Type } from "@mui/material";
import { useSnackbar } from "components/generic/Snackbar";
import { useWorkspace } from "hooks/useWorkspace";
import { layerHandlers } from "layers/layerHandlers";
import { entries, head } from "lodash";
import { nanoid as id } from "nanoid";
import pluralize from "pluralize";
import { producify } from "produce";
import { useState } from "react";
import { FileDrop } from "react-file-drop";
import { formatByte, useBusyState } from "slices/busy";
import { useLayers } from "slices/layers";
import { useAcrylic } from "theme";

export function FileDropZone() {
  const acrylic = useAcrylic() as any;
  const { load: loadWorkspace } = useWorkspace();
  const [itemCount, setItemCount] = useState<number>(0);
  const [, setLayers] = useLayers();
  const usingBusyState = useBusyState("file-drop-import");
  const notify = useSnackbar();

  async function importFiles(fs: File[]) {
    let totalClaimed = 0;
    for (const [file, i] of fs.map((...args) => args)) {
      for (const [type, { claimImportedFile }] of entries(layerHandlers)) {
        const outcome = await claimImportedFile?.(file);
        if (outcome?.claimed) {
          await usingBusyState(async () => {
            const layer = await outcome.layer(notify);
            setLayers(
              producify((prev) =>
                prev.layers.push({
                  key: id(),
                  source: { type, ...layer },
                })
              )
            );
          }, `${i + 1} of ${fs.length}: Importing ${type} (${formatByte(file.size)})`);
          totalClaimed += 1;
          continue;
        }
      }
    }
    if (!totalClaimed) {
      const success = await loadWorkspace(head(fs));
      if (success) return;
    }
    notify(
      `Couldn't open ${fs.length} of ${pluralize("file", fs.length, true)}`
    );
  }

  return (
    <>
      <FileDrop
        onFrameDragLeave={() => setItemCount(0)}
        onFrameDragEnter={(e) =>
          setItemCount(e?.dataTransfer?.items.length ?? 0)
        }
        onFrameDrop={() => setItemCount(0)}
        onDragLeave={() => setItemCount(0)}
        onDrop={(f) => f && importFiles(Array.from(f as any))}
      >
        <Backdrop
          sx={{
            ...acrylic,
            zIndex: (t) => t.zIndex.tooltip + 1,
          }}
          open={!!itemCount}
        >
          <Stack alignItems="center" spacing={4}>
            <WorkspacesOutlined />
            <Type variant="body2" color="text.secondary">
              {itemCount ? `Import ${pluralize("item", itemCount, true)}` : ""}
            </Type>
          </Stack>
        </Backdrop>
      </FileDrop>
    </>
  );
}
