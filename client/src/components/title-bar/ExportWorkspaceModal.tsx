import { DownloadOutlined, UploadOutlined } from "@mui-symbols-material/w400";
import { Box, Stack, TextField, Typography } from "@mui/material";
import { Button } from "components/generic/inputs/Button";
import { useSnackbar } from "components/generic/Snackbar";
import download from "downloadjs";
import { useDebouncedState2 } from "hooks/useDebouncedState";
import { useWorkspace } from "hooks/useWorkspace";
import { Jimp } from "jimp";
import { ceil, entries, kebabCase, reduce } from "lodash";
import { nanoid as id } from "nanoid";
import { producify } from "produce";
import { map } from "promise-tools";
import { useMemo, useState } from "react";
import { useLoadingState } from "slices/loading";
import { useUIState, WorkspaceMeta } from "slices/UIState";
import { textFieldProps, usePaper } from "theme";
import { set } from "utils/set";
import { Gallery } from "./Gallery";
import { useCloudStorageInstance } from "slices/cloudStorage";

const replacements = {
  "*": "star",
  "/": "slash",
  "+": "plus",
  "@": "at",
  "%": "percent",
  "&": "and",
};

function getFilename(name: string = "") {
  return (
    kebabCase(
      reduce(
        entries(replacements),
        (prev, [a, b]) => prev.replace(a, ` ${b} `),
        name
      )
    ) || "untitled"
  );
}

const imageSize = 64;

async function resizeImage(s: string) {
  const base64String = s.split(",")[1];
  if (!base64String) throw new Error("Invalid base64 image data");

  const binaryData = Uint8Array.from(atob(base64String), (c) =>
    c.charCodeAt(0)
  );

  const a = await Jimp.read(binaryData.buffer);
  const b =
    a.width < a.height
      ? a.resize({ w: imageSize })
      : a.resize({ h: imageSize });
  return await b
    .crop({
      x: (b.width - imageSize) / 2,
      y: (b.height - imageSize) / 2,
      w: imageSize,
      h: imageSize,
    })
    .getBase64("image/jpeg");
}

export function ExportWorkspace() {
  const paper = usePaper();
  const [_uiState, _setUIState] = useUIState();
  const [{ workspaceMeta: fields }, setUIState] = useDebouncedState2(
    _uiState,
    _setUIState
  );
  function setMeta<K extends keyof WorkspaceMeta>(k: K, v: WorkspaceMeta[K]) {
    setUIState(
      producify((prev) =>
        ///@ts-expect-error poor type inference as of TypeScript 5.7.2
        set(prev, `workspaceMeta.${k}` as `workspaceMeta.${K}`, v)
      )
    );
  }
  const { generateWorkspaceFile, estimateWorkspaceSize } = useWorkspace();
  const usingLoadingState = useLoadingState("general");
  const notify = useSnackbar();
  const storage = useCloudStorageInstance();
  const workspaceSize = useMemo(() => estimateWorkspaceSize(), []);
  const [uploading, setUploading] = useState(false);
  async function getFields(size: number): Promise<WorkspaceMeta> {
    return {
      ...fields,
      id: id(),
      size,
      screenshots: await map(fields?.screenshots ?? [], resizeImage),
      lastModified: Date.now(),
    };
  }
  return (
    <>
      <Box>
        <Gallery onChange={(v) => setMeta("screenshots", v)} />
      </Box>
      <Stack p={2} gap={2}>
        <TextField
          {...textFieldProps}
          defaultValue={fields.name}
          onChange={(e) => setMeta("name", e.target.value)}
          label="Name"
          fullWidth
        />
        <TextField
          {...textFieldProps}
          minRows={3}
          defaultValue={fields.description}
          size="small"
          onChange={(e) => setMeta("description", e.target.value)}
          label="Description"
          fullWidth
          multiline
        />
        <TextField
          {...textFieldProps}
          defaultValue={fields.author}
          size="small"
          onChange={(e) => setMeta("author", e.target.value)}
          label="Author"
          fullWidth
          multiline
        />
        <Box sx={{ pt: 2, width: "100%" }}>
          <Button
            sx={{ justifyContent: "flex-start", width: "100%", ...paper(1) }}
            disabled={uploading}
            onClick={() =>
              usingLoadingState(async () => {
                const name = getFilename(fields.name);
                // const { size } = await save(false, name);
                setUploading(true);
                const { size, compressedFile } = await generateWorkspaceFile(
                  name
                );
                const posthocMetadata = JSON.stringify(await getFields(size));
                const posthocMetaFile = new File(
                  [posthocMetadata],
                  `${name}.workspace.meta`,
                  { type: "application/json" }
                );
                await storage?.instance.saveFile(posthocMetaFile);
                // download(
                //   JSON.stringify(await getFields(size)),
                //   `${name}.workspace.meta`
                // );
                notify(`Metadata saved, ${name}.workspace.meta ✅`);

                await storage?.instance.saveFile(compressedFile);
                notify(`Posthoc file saved, ${name}.workspace ✅`);
                // todo: close the modal after the files are uploaded
                // ? remove the close button while uploading
                setUploading(false);
              })
            }
            startIcon={<UploadOutlined />}
            size="large"
          >
            <Stack sx={{ ml: 1 }} alignItems="baseline">
              {fields.name || "Untitled"}
              <Typography component="div" color="text.secondary">
                {getFilename(fields.name)}.workspace
              </Typography>
              <Typography component="div" color="text.secondary">
                {ceil(workspaceSize / 1024 / 1024, 2)} MB
              </Typography>
            </Stack>
          </Button>
        </Box>
      </Stack>
    </>
  );
}
