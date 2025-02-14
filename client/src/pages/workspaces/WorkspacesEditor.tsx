import {
  InfoOutlined,
  MoreVertOutlined,
  UploadOutlined,
} from "@mui-symbols-material/w400";
import {
  Avatar,
  CircularProgress,
  Divider,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { makeCaughtObjectReportJson } from "caught-object-report-json";
import { useSm } from "hooks/useSmallDisplay";
import { useWorkspace } from "hooks/useWorkspace";
import { FeatureCard } from "pages/ExplorePage";
import { Ref, useCallback, useRef, useState } from "react";
import { useAsync } from "react-async-hook";
import { useMeasure } from "react-use";
import {
  FileMetadata,
  PosthocMetaData,
} from "services/cloud-storage/CloudStorage";
import {
  useCloudStorageInstance,
  useCloudStorageService,
} from "slices/cloudStorage";
import { useLoadingState } from "slices/loading";
import { useSnackbar } from "../../components/generic/Snackbar";
import { Button } from "../../components/generic/inputs/Button";
import { IconButtonWithTooltip } from "../../components/generic/inputs/IconButtonWithTooltip";
import { Surface, useSurface } from "../../components/generic/surface";
import { useSurfaceAvailableCssSize } from "../../components/generic/surface/useSurfaceSize";
import { useViewTreeContext } from "../../components/inspector/ViewTree";
import { FileShareSurface } from "../../components/FileShareSurface";
import { ExportWorkspace } from "components/title-bar/ExportWorkspaceModal";
import { WorkspaceMeta } from "slices/UIState";

const FileList = ({
  fileMetaDataList,
}: {
  fileMetaDataList: WorkspaceMeta[];
}) => {
  const usingLoadingState = useLoadingState();
  const [{ instance: cloudService }] = useCloudStorageService();
  const notify = useSnackbar();
  const { load } = useWorkspace();

  const handleView = async (fileId: string) => {
    usingLoadingState(async () => {
      try {
        const file = await cloudService?.getFile(fileId);
        load(file);
      } catch (e: unknown) {
        notify(
          "Couldn't open file",
          makeCaughtObjectReportJson(e).message ?? ""
        );
      }
    });
  };

  return (
    <Stack
      sx={{
        display: "grid",
        gridAutoFlow: "row",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
        gap: 2,
      }}
    >
      {fileMetaDataList.map((file) => (
        <FeatureCard
          name={file.name}
          description={file.description}
          image={file.screenshots![0]}
          key={file.id}
          id={file.id}
          size={file.size}
          onOpenClick={() => handleView(file.id)}
          loading={false}
        >
          <Surface
            title="Workspace details"
            trigger={({ open }) => (
              <Button
                sx={{ mt: -1 }}
                variant="text"
                startIcon={<InfoOutlined />}
                onClick={open}
              >
                Workspace details
              </Button>
            )}
          >
            <FileShareSurface file={file} />
          </Surface>
        </FeatureCard>
      ))}
    </Stack>
  );
};

const UploadWorkspace = () => {
  const { open, dialog } = useSurface(FileShareSurface, {
    title: "Workspace details",
  });

  const [uploading, setUploading] = useState(false);
  const notify = useSnackbar();
  const storage = useCloudStorageInstance();
  const {
    open: openUploadWorkspaceModal,
    dialog: uploadWorkspaceDialog,
    close: closeUploadWorkspaceDialog,
  } = useSurface(ExportWorkspace, {
    title: "Upload Workspace",
  });

  const [{ instance: cloudService }] = useCloudStorageService();
  const { generateWorkspaceFile } = useWorkspace();

  //
  const handleUpload = async () => {
    try {
      setUploading(true);
      openUploadWorkspaceModal({
        uploadFile: storage?.instance.saveFile,
        closePopup: closeUploadWorkspaceDialog
      });
      // const { compressedFile: file } = await generateWorkspaceFile();
      // if (storage?.auth.authenticated && file) {
      //   await cloudService?.saveFile(file);
      //   if (file) {
      //     open({
      //       file: {
      //         id: file.name,
      //         name: file.name,
      //         mimeType: file.type,
      //         size: `${file.size}`,
      //         modifiedTime: `${file.lastModified}`,
      //       },
      //     });
      //     notify("Workspace uploaded");
      //   }
      // } else {
      //   // ? allow empty workspace upload?
      //   notify("Please start a workspace first");
      // }
    } catch (error) {
      console.log(error);
      notify("Unable to upload workspace right now");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack sx={{ width: "100%", gap: 2 }}>
      <Typography variant="overline" color="text.secondary">
        Share this workspace
      </Typography>
      <Button
        disabled={uploading}
        variant="contained"
        onClick={handleUpload}
        startIcon={<UploadOutlined color="primary" />}
      >
        {uploading ? "Saving" : "Upload current workspace"}
      </Button>
      {dialog}
      {uploadWorkspaceDialog}
    </Stack>
  );
};

const WorkspacesEditor = () => {
  const sm = useSm();
  const { isViewTree } = useViewTreeContext();
  const [ref, { width }] = useMeasure();
  const height = useSurfaceAvailableCssSize()?.height;
  const storage = useCloudStorageInstance();
  const [list, setList] = useState<WorkspaceMeta[]>([]);
  const [loadingSavedFilesMetaData, setSavedFilesMetaData] = useState(false);
  const f = useCallback(async () => {
    if (storage?.instance && storage?.auth?.authenticated) {
      try {
        setSavedFilesMetaData(true);

        // const res = await storage.instance.getIndex();
        // * while dev, use empty list
        const res = [];

        if (res) setList(res);
      } catch (error) {
        console.log(error);
      } finally {
        setSavedFilesMetaData(false);
      }
    }
  }, [storage?.instance, storage]);
  useAsync(f, [f]);
  const [open, setOpen] = useState(false);
  const anchorEl = useRef<HTMLElement | null>(null);
  const handleMenuOpen = (e) => {
    e.preventDefault();
    anchorEl.current = e.currentTarget;
    setOpen(true);
  };

  const handleMenuClose = () => {
    setOpen(false);
  };
  const padding = sm || isViewTree ? 2 : 3;
  const dual = width > 740;

  return (
    <Stack ref={ref as Ref<HTMLDivElement>}>
      {!!storage &&
        (storage?.auth?.authenticated ? (
          <Stack
            direction={dual ? "row" : "column"}
            gap={dual ? 2 : 0}
            sx={{
              visibility: width ? "visible" : "hidden",
              px: padding,
              py: 2,
              gap: padding,
              mx: "auto",
              // Subtract height of app bar
              minHeight: (t) =>
                `calc(${height} - ${t.spacing(isViewTree ? 0 : 6)})`,
              width: "100%",
            }}
          >
            <Stack
              sx={{
                gap: 2,
                width: "100%",
                ...(dual && {
                  maxWidth: 280,
                  position: "sticky",
                  top: 64,
                  left: 0,
                  height: "max-content",
                }),
              }}
            >
              <Typography variant="overline" color="text.secondary">
                {storage.meta.name} account
              </Typography>
              <ListItem disablePadding>
                <ListItemAvatar>
                  <Avatar src={storage?.auth?.user?.profile} />
                </ListItemAvatar>
                <ListItemText
                  primary={storage?.auth?.user?.name}
                  secondary="Signed in"
                />
                <IconButtonWithTooltip
                  onClick={handleMenuOpen}
                  label="Account options"
                  edge="end"
                  icon={<MoreVertOutlined color="action" fontSize="small" />}
                />
                <Menu
                  anchorEl={anchorEl.current}
                  open={open}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    onClick={() => {
                      // * this could be async
                      storage.instance.logout();
                      handleMenuClose();
                    }}
                  >
                    Logout
                  </MenuItem>
                </Menu>
              </ListItem>
              <UploadWorkspace />
            </Stack>
            {dual && (
              <Divider sx={{ my: -2 }} orientation="vertical" flexItem />
            )}
            <Stack sx={{ gap: 2, width: "100%", flex: 1 }}>
              <Typography variant="overline" color="text.secondary">
                Available workspaces
              </Typography>
              {loadingSavedFilesMetaData ? (
                <CircularProgress size={30} />
              ) : list.length ? (
                <FileList fileMetaDataList={list} />
              ) : (
                <Typography color="text.secondary">
                  No workspaces found
                </Typography>
              )}
            </Stack>
          </Stack>
        ) : (
          <Stack sx={{ p: sm ? 2 : 3, gap: 2, alignItems: "center" }}>
            {storage.meta.loginUI?.(storage.instance)}
          </Stack>
        ))}
    </Stack>
  );
};

export default WorkspacesEditor;
