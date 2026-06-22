import { UploadOutlined } from "@mui-symbols-material/w300";
import { Box, Stack, TextField, Typography } from "@mui/material";
import { Button } from "components/generic/inputs/Button";
import { useSnackbar } from "components/generic/Snackbar";
import { SurfaceContentProps } from "components/generic/surface";
import download from "downloadjs";
import { useWorkspace } from "hooks/useWorkspace";
import { kebabCase } from "es-toolkit";
import { ceil, toPairs as entries, reduce } from "es-toolkit/compat";
import pica from "pica";
import { nanoid as id } from "nanoid";
import { map } from "promise-tools";
import { useMemo, useState } from "react";
import { CloudStorageProvider, cloudStorageProviders } from "services/cloud-storage";
import { useLoadingState } from "slices/loading";
import { workspaceMeta, WorkspaceMeta } from "slices/UIState";
import { textFieldProps, usePaper } from "theme";
import { Gallery } from "./Gallery";
import { useOne } from "slices/useOne";

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
    kebabCase(reduce(entries(replacements), (prev, [a, b]) => prev.replace(a, ` ${b} `), name)) ||
    "untitled"
  );
}

const imageSize = 64;

const resizer = pica();

async function resizeImage(s: string) {
  const base64String = s.split(",")[1];
  if (!base64String) throw new Error("Invalid base64 image data");

  const binaryData = Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0));

  const source = await createImageBitmap(new Blob([binaryData.buffer]));

  // Scale so the shorter edge becomes `imageSize` (cover), then centre-crop.
  const scale = imageSize / Math.min(source.width, source.height);
  const cover = document.createElement("canvas");
  cover.width = Math.round(source.width * scale);
  cover.height = Math.round(source.height * scale);
  await resizer.resize(source, cover);

  const cropped = document.createElement("canvas");
  cropped.width = imageSize;
  cropped.height = imageSize;
  cropped
    .getContext("2d")!
    .drawImage(cover, (cover.width - imageSize) / 2, (cover.height - imageSize) / 2);

  return cropped.toDataURL("image/jpeg");
}

export function ExportWorkspace({
  uploadFile,
}: {
  uploadFile?: CloudStorageProvider<keyof typeof cloudStorageProviders, unknown>["saveFile"];
} & SurfaceContentProps) {
  const paper = usePaper();
  const fields = useOne(workspaceMeta);
  const { generateWorkspaceFile, estimateWorkspaceSize, save } = useWorkspace();
  const usingLoadingState = useLoadingState("general");
  const notify = useSnackbar();
  // const storage = useCloudStorageInstance();
  const workspaceSize = useMemo(() => estimateWorkspaceSize(), [estimateWorkspaceSize]);
  const [uploading, setUploading] = useState(false);
  async function getFields(size: number, lastModified: number): Promise<WorkspaceMeta> {
    return {
      ...fields,
      id: id(),
      size,
      screenshots: await map(fields?.screenshots ?? [], resizeImage),
      lastModified,
    };
  }

  return (
    <>
      <Box>
        <Gallery onChange={(v) => workspaceMeta.assign({ screenshots: v })} />
      </Box>
      <Stack sx={{ p: 2, gap: 2 }}>
        <TextField
          {...textFieldProps}
          defaultValue={fields.name}
          onChange={(e) => workspaceMeta.assign({ name: e.target.value })}
          label="Name"
          fullWidth
        />
        <TextField
          {...textFieldProps}
          minRows={3}
          defaultValue={fields.description}
          size="small"
          onChange={(e) => workspaceMeta.assign({ description: e.target.value })}
          label="Description"
          fullWidth
          multiline
        />
        <TextField
          {...textFieldProps}
          defaultValue={fields.author}
          size="small"
          onChange={(e) => workspaceMeta.assign({ author: e.target.value })}
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

                setUploading(true);
                const { file } = await generateWorkspaceFile(name);
                const posthocMetadata = JSON.stringify(await getFields(file.size, Date.now()));
                const posthocMetaFile = new File([posthocMetadata], `${name}.workspace.meta`, {
                  type: "application/json",
                });

                if (uploadFile) {
                  await uploadFile(posthocMetaFile);
                  // await storage?.instance.saveFile(posthocMetaFile);
                } else {
                  download(posthocMetadata, `${name}.workspace.meta`);
                }
                notify(`Metadata saved, ${name}.workspace.meta ✅`);

                if (uploadFile) {
                  await uploadFile(file);
                  // await storage?.instance.saveFile(compressedFile);
                } else {
                  await save(false, `${name}.workspace`);
                }
                notify(`Posthoc file saved, ${name}.workspace ✅`);
              })
            }
            startIcon={<UploadOutlined />}
            size="large"
          >
            <Stack sx={{ ml: 1, alignItems: "baseline" }}>
              {fields.name || "Untitled"}
              <Typography component="div" color="textSecondary">
                {getFilename(fields.name)}.workspace
              </Typography>
              <Typography component="div" color="textSecondary">
                {ceil(workspaceSize / 1024 / 1024, 2)} MB
              </Typography>
            </Stack>
          </Button>
        </Box>
      </Stack>
    </>
  );
}
