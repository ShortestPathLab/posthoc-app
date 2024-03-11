import { DownloadOutlined } from "@mui/icons-material";
import { Box, Stack, TextField, Typography } from "@mui/material";
import { Button } from "components/generic/Button";
import Modal, { ModalAppBar } from "components/generic/Modal";
import { useSnackbar } from "components/generic/Snackbar";
import download from "downloadjs";
import { useEffectWhen } from "hooks/useEffectWhen";
import { useWorkspace } from "hooks/useWorkspace";
import { ceil, delay, kebabCase, omit } from "lodash";
import { map } from "promise-tools";
import { ComponentProps, useMemo } from "react";
import { useMap } from "react-use";
import { WorkspaceMeta, useUIState } from "slices/UIState";
import { useLoadingState } from "slices/loading";
import { textFieldProps, usePaper } from "theme";
import { Jimp } from "utils/Jimp";
import { Gallery } from "./Gallery";
import { nanoid as id } from "nanoid";

function getFilename(s: string = "") {
  return kebabCase(s.replace("*", " star ")) || "untitled";
}

const imageSize = 64;

async function resizeImage(s: string) {
  const a = await Jimp.read(Buffer.from(s.split(",")[1], "base64"));
  const b =
    a.getWidth() < a.getHeight()
      ? a.resize(imageSize, Jimp.AUTO)
      : a.resize(Jimp.AUTO, imageSize);
  return await b
    .crop(
      (b.getWidth() - imageSize) / 2,
      (b.getHeight() - imageSize) / 2,
      imageSize,
      imageSize
    )
    .getBase64Async("image/jpeg");
}

export function A() {
  const paper = usePaper();
  const [{ workspaceMeta }, setUIState] = useUIState();
  const [fields, { set }] = useMap<WorkspaceMeta>(
    omit(workspaceMeta, "screenshots", "size")
  );
  useEffectWhen(
    () => {
      const timeout = delay(() => {
        setUIState((prev) => ({ ...prev, workspaceMeta: fields }));
      }, 300);
      return () => clearTimeout(timeout);
    },
    [fields, setUIState],
    [fields]
  );
  const { save, estimateWorkspaceSize } = useWorkspace();
  const usingLoadingState = useLoadingState("general");
  const notify = useSnackbar();

  const workspaceSize = useMemo(estimateWorkspaceSize, []);

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
        <Gallery onChange={(v) => set("screenshots", v)} />
      </Box>
      <Stack p={2} gap={2}>
        <TextField
          {...textFieldProps}
          defaultValue={fields.name}
          onChange={(e) => set("name", e.target.value)}
          label="Name"
          fullWidth
        />
        <TextField
          {...textFieldProps}
          minRows={3}
          defaultValue={fields.description}
          size="small"
          onChange={(e) => set("description", e.target.value)}
          label="Description"
          fullWidth
          multiline
        />
        <TextField
          {...textFieldProps}
          defaultValue={fields.author}
          size="small"
          onChange={(e) => set("author", e.target.value)}
          label="Author"
          fullWidth
          multiline
        />
        <Box sx={{ pt: 2, width: "100%" }}>
          <Button
            sx={{ justifyContent: "flex-start", width: "100%", ...paper(1) }}
            onClick={() =>
              usingLoadingState(async () => {
                const name = getFilename(fields.name);
                const { size } = await save(false, name);
                download(
                  JSON.stringify(await getFields(size)),
                  `${name}.workspace.meta`
                );
                notify(`Metadata saved, ${name}.workspace.meta`);
              })
            }
            startIcon={<DownloadOutlined />}
            size="large"
          >
            <Stack sx={{ ml: 1 }} alignItems="baseline">
              {fields.name || "Untitled"}
              <Typography color="text.secondary">
                {getFilename(fields.name)}.workspace
              </Typography>
              <Typography color="text.secondary">
                {ceil(workspaceSize / 1024 / 1024, 2)} MB
              </Typography>
            </Stack>
          </Button>
        </Box>
      </Stack>
    </>
  );
}

export function ExportWorkspaceModal(props: ComponentProps<typeof Modal>) {
  return (
    <Modal {...props}>
      <ModalAppBar onClose={() => props?.onClose?.({}, "backdropClick")}>
        <Typography variant="h6">Publish Workspace</Typography>
      </ModalAppBar>
      <A />
    </Modal>
  );
}
