import { UploadOutlined } from "@mui-symbols-material/w400";
import { Box, Stack, TextField, Typography } from "@mui/material";
import { Button } from "components/generic/inputs/Button";
import { useSnackbar } from "components/generic/Snackbar";
import { SurfaceContentProps } from "components/generic/surface";
import download from "downloadjs";
import { useWorkspace } from "hooks/useWorkspace";
import { Jimp } from "jimp";
import { ceil, entries, kebabCase, reduce } from "lodash-es";
import { nanoid as id } from "nanoid";
import { map } from "promise-tools";
import { useMemo, useState } from "react";
import {
  CloudStorageProvider,
  cloudStorageProviders,
} from "services/cloud-storage";
import { useLoadingState } from "slices/loading";
import { workspaceMeta, WorkspaceMeta } from "slices/UIState";
import { textFieldProps, usePaper } from "theme";
import { Gallery } from "./Gallery";

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

export function ExportWorkspace({
  uploadFile,
}: {
  uploadFile?: CloudStorageProvider<
    keyof typeof cloudStorageProviders,
    unknown
  >["saveFile"];
} & SurfaceContentProps) {
  "use no memo";
  const paper = usePaper();
  const fields = workspaceMeta.use();
  const { generateWorkspaceFile, estimateWorkspaceSize, save } = useWorkspace();
  const usingLoadingState = useLoadingState("general");
  const notify = useSnackbar();
  // const storage = useCloudStorageInstance();
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
        <Gallery onChange={(v) => workspaceMeta.assign({ screenshots: v })} />
      </Box>
      <Stack p={2} gap={2}>
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
          onChange={(e) =>
            workspaceMeta.assign({ description: e.target.value })
          }
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
                const posthocMetadata = JSON.stringify(
                  await getFields(file.size)
                );
                const posthocMetaFile = new File(
                  [posthocMetadata],
                  `${name}.workspace.meta`,
                  { type: "application/json" }
                );

                if (uploadFile) {
                  await uploadFile(posthocMetaFile);
                  // await storage?.instance.saveFile(posthocMetaFile);
                } else {
                  download(
                    JSON.stringify(await getFields(file.size)),
                    `${name}.workspace.meta`
                  );
                }
                notify(`Metadata saved, ${name}.workspace.meta ✅`);

                if (uploadFile) {
                  await uploadFile(file);
                  // await storage?.instance.saveFile(compressedFile);
                } else {
                  await save(false, name);
                }
                notify(`Posthoc file saved, ${name}.workspace ✅`);
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
