import { DownloadOutlined } from "@mui-symbols-material/w400";
import { Box, Stack, TextField, Typography } from "@mui/material";
import { Button } from "components/generic/Button";
import Modal, { ModalAppBar } from "components/generic/Modal";
import { useSnackbar } from "components/generic/Snackbar";
import download from "downloadjs";
import { useDebouncedState2 } from "hooks/useDebouncedState";
import { useWorkspace } from "hooks/useWorkspace";
import { ceil, entries, kebabCase, reduce } from "lodash";
import { nanoid as id } from "nanoid";
import { producify } from "produce";
import { map } from "promise-tools";
import { ComponentProps, useMemo } from "react";
import { WorkspaceMeta, useUIState } from "slices/UIState";
import { useLoadingState } from "slices/loading";
import { textFieldProps, usePaper } from "theme";
import { Jimp, ResizeStrategy } from "jimp";
import { set } from "utils/set";
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
  const a = await Jimp.read(Buffer.from(s.split(",")[1], "base64"));
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

export function A() {
  const paper = usePaper();
  const [_uiState, _setUIState] = useUIState();
  const [{ workspaceMeta: fields }, setUIState] = useDebouncedState2(
    _uiState,
    _setUIState
  );
  function set2(k: keyof WorkspaceMeta, v: any) {
    setUIState(producify((prev) => set(prev, `workspaceMeta.${k}`, v)));
  }
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
        <Gallery onChange={(v) => set2("screenshots", v)} />
      </Box>
      <Stack p={2} gap={2}>
        <TextField
          {...textFieldProps}
          defaultValue={fields.name}
          onChange={(e) => set2("name", e.target.value)}
          label="Name"
          fullWidth
        />
        <TextField
          {...textFieldProps}
          minRows={3}
          defaultValue={fields.description}
          size="small"
          onChange={(e) => set2("description", e.target.value)}
          label="Description"
          fullWidth
          multiline
        />
        <TextField
          {...textFieldProps}
          defaultValue={fields.author}
          size="small"
          onChange={(e) => set2("author", e.target.value)}
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

export function ExportWorkspaceModal(props: ComponentProps<typeof Modal>) {
  return (
    <Modal {...props}>
      <ModalAppBar onClose={() => props?.onClose?.({}, "backdropClick")}>
        <Typography component="div" variant="h6">
          Publish Workspace
        </Typography>
      </ModalAppBar>
      <A />
    </Modal>
  );
}
