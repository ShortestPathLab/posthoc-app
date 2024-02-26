import { WorkspacesOutlined } from "@mui/icons-material";
import { Backdrop, Stack, Typography as Type } from "@mui/material";
import { useSnackbar } from "components/generic/Snackbar";
import { useWorkspace } from "hooks/useWorkspace";
import { layerHandlers } from "layers/layerHandlers";
import { entries, head } from "lodash";
import { nanoid as id } from "nanoid";
import pluralize, { plural } from "pluralize";
import { producify } from "produce";
import { useState } from "react";
import { FileDrop } from "react-file-drop";
import { formatByte, useBusyState } from "slices/busy";
import { useLayers } from "slices/layers";
import { useAcrylic } from "theme";

export function FileDropZone() {
  const acrylic = useAcrylic() as any;
  const { load: loadWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
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
          }, `${i + 1} of ${fs.length}: Opening ${type} (${formatByte(file.size)})`);
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
        onFrameDragLeave={() => setOpen(false)}
        onFrameDragEnter={() => setOpen(true)}
        onFrameDrop={() => setOpen(false)}
        onDragLeave={() => setOpen(false)}
        onDrop={(f) => f && importFiles(Array.from(f as any))}
      >
        <Backdrop
          sx={{
            ...acrylic,
            zIndex: (t) => t.zIndex.tooltip + 1,
          }}
          open={open}
        >
          <Stack alignItems="center" spacing={4}>
            <WorkspacesOutlined />
            <Type variant="body2" color="text.secondary">
              Import
            </Type>
          </Stack>
        </Backdrop>
      </FileDrop>
    </>
  );
}
