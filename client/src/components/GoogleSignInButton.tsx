import {
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FileMetaData } from "services/CloudStorageService";
import GoogleIcon from "@mui/icons-material/Google";
import { Button } from "./generic/inputs/Button";
import { MouseEventHandler, useState } from "react";
import { useAuth } from "slices/auth";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useCloudStorageService } from "slices/cloudStorage";
import copy from "clipboard-copy";
import { useWorkspace } from "hooks/useWorkspace";
import { useAsync } from "react-async-hook";
import DescriptionIcon from "@mui/icons-material/Description";
import { useLoadingState } from "slices/loading";
import { useSnackbar } from "./generic/Snackbar";

const FileList = ({
  fileMetaDataList,
}: {
  fileMetaDataList: FileMetaData[];
}) => {
  const usingLoadingState = useLoadingState();
  const [{ instance: cloudService }] = useCloudStorageService();
  const notify = useSnackbar();
  const { load } = useWorkspace();
  const formatSize = (size: string) => {
    const sizeNum = parseInt(size);
    if (sizeNum < 1024) return `${sizeNum} bytes`;
    if (sizeNum < 1024 * 1024) return `${(sizeNum / 1024).toFixed(2)} KB`;
    return `${(sizeNum / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleView = async (fileId: string) => {
    usingLoadingState(async () => {
      try {
        const file = await cloudService?.getFile(fileId);
        load(file);
      } catch {
        notify("Failed to fetch file from source");
      }
    });
  };

  const handleShare = async (fileId: string) => {
    try {
      const link = cloudService?.generateLink(fileId);
      if (link) await copy(link);
      else {
        throw new Error("Unable to generate link");
      }
    } catch {
      notify("Unable to generate link");
    }
  };
  return (
    <List>
      {fileMetaDataList.map((file, index) => (
        <div key={file.id}>
          <ListItem>
            <ListItemIcon>
              <DescriptionIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={file.name}
              secondary={
                <>
                  <Typography variant="body2" color="textSecondary">
                    Type: {file.mimeType}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Size: {formatSize(file.size)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Modified: {new Date(file.modifiedTime).toLocaleString()}
                  </Typography>
                </>
              }
            />
            <Stack direction="column" spacing={1} sx={{ mx: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleView(file.id)}
              >
                View
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => handleShare(file.id)}
              >
                Share
              </Button>
            </Stack>
          </ListItem>
          {index < fileMetaDataList.length - 1 && <Divider />}
        </div>
      ))}
    </List>
  );
};
const UploadWorkspace = () => {
  const [uploading, setUploading] = useState(false);
  const notify = useSnackbar();
  const [authState] = useAuth();
  const [{ instance: cloudService }] = useCloudStorageService();
  const [link, setLink] = useState<string>("");
  const { generateWorkspaceFile } = useWorkspace();
  const handleUpload = async () => {
    try {
      setUploading(true);
      const { compressedFile } = await generateWorkspaceFile();
      if (authState.authenticated && compressedFile) {
        const res = await cloudService?.saveFile(compressedFile);
        setLink(res ? cloudService?.generateLink(res) ?? "" : "");
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

  const handleCopy: MouseEventHandler<HTMLButtonElement> = async () => {
    try {
      await copy(link);
    } catch {
      notify("Unable to copy url, pls copy manually");
    }
  };

  return (
    <div style={{ margin: "1em auto" }}>
      <Button
        disabled={uploading}
        variant="contained"
        onClick={handleUpload}
        color="primary"
      >
        {uploading ? <CircularProgress size={"25px"} /> : "Upload Workspace"}
      </Button>

      {link !== "" && (
        <div style={{ margin: "20px" }}>
          <TextField
            value={link}
            fullWidth
            disabled
            variant="outlined"
            margin="normal"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="copy-link"
                      color="primary"
                      onClick={handleCopy}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

const GoogleSignInButton = () => {
  // const { cloudService } = useSavedLogsService("google");
  const [authState] = useAuth();
  const [{ instance: cloudService }] = useCloudStorageService();
  const [list, setList] = useState<FileMetaData[]>([]);
  const [loadingSavedFilesMetaData, setSavedFilesMetaData] = useState(false);
  useAsync(async () => {
    if (authState.authenticated) {
      try {
        setSavedFilesMetaData(true);
        const res = await cloudService?.getSavedFilesMetaData();
        if (res) setList(res);
        console.log(res);
      } catch (error) {
        console.log(error);
      } finally {
        setSavedFilesMetaData(false);
      }
    }
  }, [cloudService, authState.authenticated]);
  if (authState == undefined) {
    return (
      <Typography variant="body2" align="center" color="text.secondary">
        Checking Authentication...
      </Typography>
    );
  }
  const loginMessage = "Login with Google to save and share your search traces";
  const loggedInMessage = "You are logged in with your google account.";
  return (
    <>
      <Typography variant="body2" align="center" color="text.secondary">
        {authState?.authenticated ? loggedInMessage : loginMessage}
      </Typography>
      {!authState?.authenticated ? (
        <IconButton
          onClick={cloudService?.authenticate}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            border: "1px solid #d9d9d9",
            borderRadius: "50px",
            padding: "8px 16px",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          <GoogleIcon sx={{ color: "#4285F4", marginRight: "8px" }} />
          <Typography
            sx={{ fontSize: "16px", fontWeight: "500", color: "#202124" }}
          >
            Continue with Google
          </Typography>
        </IconButton>
      ) : (
        <div
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            rowGap: "1em",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* how to handle uploading? */}
          <UploadWorkspace />
          {loadingSavedFilesMetaData ? (
            <CircularProgress size={30} />
          ) : (
            <FileList fileMetaDataList={list} />
          )}
        </div>
      )}
    </>
  );
};

export default GoogleSignInButton;
