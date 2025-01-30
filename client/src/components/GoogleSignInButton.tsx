import {
  CloseOutlined,
  InfoOutlined,
  LinkOutlined,
  MoreVertOutlined,
  OpenInNewOutlined,
  UploadOutlined,
} from "@mui-symbols-material/w400";
import GoogleIcon from "@mui/icons-material/Google";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { makeCaughtObjectReportJson } from "caught-object-report-json";
import copy from "clipboard-copy";
import { useSm } from "hooks/useSmallDisplay";
import { useWorkspace } from "hooks/useWorkspace";
import { round } from "lodash";
import { FeatureCard } from "pages/ExplorePage";
import { Ref, useCallback, useMemo, useState } from "react";
import { useAsync } from "react-async-hook";
import { useMeasure } from "react-use";
import { FileMetadata } from "services/cloud-storage/CloudStorage";
import { useAuth } from "slices/auth";
import { useCloudStorageService } from "slices/cloudStorage";
import { useLoadingState } from "slices/loading";
import { usePaper } from "theme";
import { useSnackbar } from "./generic/Snackbar";
import { Button } from "./generic/inputs/Button";
import { IconButtonWithTooltip } from "./generic/inputs/IconButtonWithTooltip";
import { Surface, useSurface } from "./generic/surface";
import { useViewTreeContext } from "./inspector/ViewTree";
import { useSurfaceAvailableCssSize } from "./generic/surface/useSurfaceSize";

const FileShareSurface = ({ file }: { file: FileMetadata }) => {
  const [{ instance: cloudService }] = useCloudStorageService();
  const sm = useSm();
  const paper = usePaper();
  const notify = useSnackbar();
  const link = useMemo(
    () => cloudService?.generateLink(file.id),
    [cloudService, file.id]
  );
  const handleCopy = async () => {
    try {
      if (link) {
        await copy(link);
        notify("Copied to clipboard");
        return link;
      } else {
        throw new Error("Unable to generate link");
      }
    } catch {
      notify("Unable to generate link");
    }
  };
  const handleShare = async () => {
    try {
      const link = cloudService?.generateLink(file.id);
      await navigator.share({
        title: "Posthoc visualisation",
        text: link ?? "",
      });
    } catch {
      notify("Unable to generate link");
    }
  };
  return (
    <Stack sx={{ p: sm ? 2 : 3, gap: 2 }}>
      <Box sx={{ width: 128, height: 128, ...paper(1) }} />
      <ListItemText
        primary={file.name}
        secondary={
          <>
            <Typography variant="body2" color="textSecondary">
              Type: {file.mimeType}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Size: {round(+file.size / 1024 / 1024, 2)} MB
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Modified: {new Date(file.modifiedTime).toLocaleString()}
            </Typography>
          </>
        }
      ></ListItemText>
      <Stack sx={{ gap: 1 }}>
        <Surface
          title="Shareable link"
          trigger={({ open }) => {
            return (
              <Button
                variant="contained"
                startIcon={<LinkOutlined color="primary" />}
                onClick={() => {
                  if (link) {
                    open();
                  }
                }}
              >
                Get shareable link
              </Button>
            );
          }}
        >
          <Stack sx={{ p: sm ? 2 : 3, gap: 1, pb: 6 }} direction="row">
            <TextField
              sx={{ flex: 1 }}
              label="Link"
              variant="filled"
              value={link}
              autoFocus
            />
            <Button variant="outlined" onClick={handleCopy}>
              Copy
            </Button>
          </Stack>
        </Surface>
        <Button
          disabled={!navigator.share}
          variant="text"
          startIcon={<OpenInNewOutlined />}
          onClick={handleShare}
        >
          Share via system
        </Button>
        <Button
          disabled={!navigator.share}
          variant="text"
          startIcon={<CloseOutlined color="error" />}
          onClick={handleShare}
        >
          Delete workspace
        </Button>
      </Stack>
    </Stack>
  );
};

const FileList = ({
  fileMetaDataList,
}: {
  fileMetaDataList: FileMetadata[];
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
          description={JSON.stringify(file)}
          key={file.id}
          id={file.id}
          size={+file.size}
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
  const [authState] = useAuth();
  const [{ instance: cloudService }] = useCloudStorageService();
  const { generateWorkspaceFile } = useWorkspace();
  const handleUpload = async () => {
    try {
      setUploading(true);
      const { compressedFile: file } = await generateWorkspaceFile();
      if (authState.authenticated && file) {
        await cloudService?.saveFile(file);
        if (file) {
          open({
            file: {
              id: file.name,
              name: file.name,
              mimeType: file.type,
              size: `${file.size}`,
              modifiedTime: `${file.lastModified}`,
            },
          });
          notify("Workspace uploaded");
        }
      } else {
        // ? allow empty workspace upload?
        notify("Please start a workspace first");
      }
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
    </Stack>
  );
};

const GoogleSignInButton = () => {
  const sm = useSm();
  const { isViewTree } = useViewTreeContext();
  const [ref, { width }] = useMeasure();
  const height = useSurfaceAvailableCssSize()?.height;
  // const { cloudService } = useSavedLogsService("google");
  const [authState] = useAuth();
  const [{ instance: cloudService }] = useCloudStorageService();
  const [list, setList] = useState<FileMetadata[]>([]);
  const [loadingSavedFilesMetaData, setSavedFilesMetaData] = useState(false);
  const f = useCallback(async () => {
    if (authState.authenticated && cloudService) {
      try {
        setSavedFilesMetaData(true);
        const res = await cloudService.getSavedFilesMetadata();
        if (res) setList(res);
        console.log(res);
      } catch (error) {
        console.log(error);
      } finally {
        setSavedFilesMetaData(false);
      }
    }
  }, [cloudService, authState.authenticated]);
  useAsync(f, [f]);
  if (authState == undefined) {
    return (
      <Typography variant="body2" align="center" color="text.secondary">
        Checking Authentication...
      </Typography>
    );
  }
  const loginMessage =
    "Sign in to save and share your visualisations via Google Drive";

  const padding = sm || isViewTree ? 2 : 3;
  const dual = width > 740;

  return (
    <Stack ref={ref as Ref<HTMLDivElement>}>
      {authState?.authenticated ? (
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
              Google account
            </Typography>
            <ListItem disablePadding>
              <ListItemAvatar>
                <Avatar src={authState?.user?.profile} />
              </ListItemAvatar>
              <ListItemText
                primary={authState?.user?.name}
                secondary={"Signed in"}
              />
              <IconButtonWithTooltip
                label="Account options"
                edge="end"
                icon={<MoreVertOutlined color="action" fontSize="small" />}
              />
            </ListItem>
            <UploadWorkspace />
          </Stack>
          {dual && <Divider sx={{ my: -2 }} orientation="vertical" flexItem />}
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
          <Typography variant="body2" align="center" color="text.secondary">
            {loginMessage}
          </Typography>
          <Button
            sx={{ width: 360, maxWidth: "100%" }}
            onClick={cloudService?.authenticate}
            variant="contained"
            startIcon={<GoogleIcon color="primary" />}
          >
            Continue with Google
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default GoogleSignInButton;
