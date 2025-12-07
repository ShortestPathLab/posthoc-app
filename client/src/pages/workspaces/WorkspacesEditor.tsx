import {
  InfoOutlined,
  MoreVertOutlined,
  UploadOutlined,
} from "@mui-symbols-material/w400";
import share from "./share.svg";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { makeCaughtObjectReportJson } from "caught-object-report-json";
import { FileShareSurface } from "components/FileShareSurface";
import { useSnackbar } from "components/generic/Snackbar";
import { Button } from "components/generic/inputs/Button";
import { IconButtonWithTooltip } from "components/generic/inputs/IconButtonWithTooltip";
import { Surface, useSurface } from "components/generic/surface";
import { useSurfaceAvailableCssSize } from "components/generic/surface/useSurfaceSize";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { ExportWorkspace } from "components/title-bar/ExportWorkspaceModal";
import { useSm } from "hooks/useSmallDisplay";
import { useWorkspace } from "hooks/useWorkspace";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { FeatureCard } from "pages/ExplorePage";
import { Ref, useCallback, useState } from "react";
import { useAsync } from "react-async-hook";
import { useMeasure } from "react-use";
import { WorkspaceMeta } from "slices/UIState";
import {
  useCloudStorageInstance,
  useCloudStorageService,
} from "slices/cloudStorage";
import { useLoadingState } from "slices/loading";

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
          makeCaughtObjectReportJson(e).message ?? "",
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

  const handleUpload = async () => {
    try {
      setUploading(true);
      openUploadWorkspaceModal({
        uploadFile: storage?.instance.saveFile,
        onClose: closeUploadWorkspaceDialog,
      });
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
      {uploadWorkspaceDialog}
    </Stack>
  );
};

const WorkspacesEditor = () => {
  const sm = useSm();
  const notify = useSnackbar();
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

        const res = await storage.instance.getIndex();
        // * while dev, use empty list
        // const res = [];

        if (res) setList(res);
      } catch (error) {
        console.log(error);
      } finally {
        setSavedFilesMetaData(false);
      }
    }
  }, [storage?.instance, storage]);
  useAsync(f, [f]);
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
                <PopupState variant="popover">
                  {(state) => (
                    <>
                      <IconButtonWithTooltip
                        {...bindTrigger(state)}
                        label="Account options"
                        edge="end"
                        icon={
                          <MoreVertOutlined color="action" fontSize="small" />
                        }
                      />
                      <Menu
                        {...bindMenu(state)}
                        transformOrigin={{
                          horizontal: "right",
                          vertical: "top",
                        }}
                        anchorOrigin={{
                          horizontal: "right",
                          vertical: "top",
                        }}
                      >
                        <MenuItem
                          dense
                          onClick={async () => {
                            notify("Logging out");
                            // * this could be async
                            await storage.instance.logout();
                            notify("Logged out");
                          }}
                        >
                          Log out
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </PopupState>
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
          <Stack
            sx={{
              p: sm ? 2 : 3,
              gap: 1,
              alignItems: "center",
              justifyContent: "center",
              pb: 24,
              textAlign: "center",
              minHeight: (t) =>
                `calc(${height} - ${t.spacing(isViewTree ? 0 : 6)})`,
            }}
          >
            <Box
              sx={{ width: "100%", maxWidth: 380, p: 4 }}
              component="img"
              src={share}
            />
            <Stack sx={{ gap: 1, mb: 8, alignItems: "center", maxWidth: 460 }}>
              <Typography variant="h6">
                Store your visualisations in the cloud
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Share, collaborate, and showcase your work effortlessly. Save
                your workspaces to the cloud to easily share with others—or
                simply use it for secure file storage.
              </Typography>
            </Stack>
            {storage.meta.loginUI?.(storage.instance)}
            <Button variant="text">Other sign in options</Button>
          </Stack>
        ))}
    </Stack>
  );
};

export default WorkspacesEditor;
