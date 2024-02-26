import { WorkspacesOutlined } from "@mui/icons-material";
import { Backdrop, Stack, Typography as Type } from "@mui/material";
import { useWorkspace } from "hooks/useWorkspace";
import { head } from "lodash";
import { useState } from "react";
import { FileDrop } from "react-file-drop";
import { useAcrylic } from "theme";

export function WorkspaceDropZone() {
  const acrylic = useAcrylic() as any;
  const { load } = useWorkspace();
  const [open, setOpen] = useState(false);
  return (
    <>
      <FileDrop
        onFrameDragLeave={() => setOpen(false)}
        onFrameDragEnter={() => setOpen(true)}
        onFrameDrop={() => setOpen(false)}
        onDragLeave={() => setOpen(false)}
        onDrop={(f) => f?.length && load(head(f))}
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
            <Type variant="body2" color="textSecondary">
              Open
            </Type>
          </Stack>
        </Backdrop>
      </FileDrop>
    </>
  );
}
