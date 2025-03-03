import { WorkspacesOutlined } from "@mui-symbols-material/w400";
import { Backdrop, Stack, Typography as Type } from "@mui/material";
import { useSnackbar } from "components/generic/Snackbar";
import { useWorkspace } from "hooks/useWorkspace";
import { getControllers } from "layers/layerControllers";
import { entries, head } from "lodash-es";
import { nanoid as id } from "nanoid";
import pluralize from "pluralize";
import { useState } from "react";
import { FileDrop } from "react-file-drop";
import { slice } from "slices";
import { formatByte, useBusyState } from "slices/busy";
import { useAcrylic } from "theme";

export function useFileImport() {
  const { load: loadWorkspace } = useWorkspace();
  const usingBusyState = useBusyState("file-drop-import");
  const notify = useSnackbar();

  return async function importFiles(fs: File[]) {
    let totalClaimed = 0;
    for (const [file, i] of fs.map((...args) => args)) {
      for (const [type, { claimImportedFile }] of entries(getControllers())) {
        const outcome = await claimImportedFile?.(file);
        if (outcome?.claimed) {
          await usingBusyState(
            async () => {
              const layer = await outcome.layer(notify);
              slice.layers.set(
                (l) =>
                  void l.push({
                    key: id(),
                    source: { type, ...layer },
                  })
              );
            },
            `${i + 1} of ${fs.length}: Importing ${type} (${formatByte(file.size)})`
          );
          totalClaimed++;
          continue;
        }
      }
    }
    if (totalClaimed) return;
    const success = await loadWorkspace(head(fs));
    if (success) return;
    notify(
      `Couldn't open ${fs.length} of ${pluralize("file", fs.length, true)}`
    );
  };
}

export function FileDropZone() {
  const acrylic = useAcrylic();
  const [itemCount, setItemCount] = useState<number>(0);
  const importFiles = useFileImport();
  return (
    <FileDrop
      onFrameDragLeave={() => setItemCount(0)}
      onFrameDragEnter={(e) => setItemCount(e?.dataTransfer?.items.length ?? 0)}
      onFrameDrop={() => setItemCount(0)}
      onDragLeave={() => setItemCount(0)}
      onDrop={(f) => f && importFiles(Array.from(f))}
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
          <Type component="div" variant="body2" color="text.secondary">
            {itemCount ? `Import ${pluralize("item", itemCount, true)}` : ""}
          </Type>
        </Stack>
      </Backdrop>
    </FileDrop>
  );
}
