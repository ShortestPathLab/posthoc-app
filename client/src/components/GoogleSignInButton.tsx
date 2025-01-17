import {
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { CloudStorageService } from "services/CloudStorageService";
import GoogleIcon from "@mui/icons-material/Google";
import { Button } from "./generic/Button";
import { MouseEventHandler, useState } from "react";
import { useAuth } from "slices/auth";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useCloudStorageService } from "slices/cloudStorage";
import copy from "clipboard-copy";
import { useWorkspace } from "hooks/useWorkspace";
const FileComponent = ({
  saveFile,
  uploading,
}: {
  uploading: boolean;
  saveFile?: CloudStorageService["saveFile"];
}) => {
  const [authState, setAuthState] = useAuth();
  const [fileName, setFileName] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [link, setLink] = useState<string>("");
  const { generateWorkspaceFile } = useWorkspace();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };
  const handleUpload = async () => {
    try {
      setAuthState(() => ({}));
      const { compressedFile } = await generateWorkspaceFile();
      if (compressedFile) {
        const res = await saveFile?.(compressedFile);
        // todo: handle file not being saved
        setLink(
          res === ""
            ? res
            : `${window.location.origin}/#fetch-gdrive-file?fileId=${res}`
        );
      } else {
        alert("Please select a file first");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCopy: MouseEventHandler<HTMLButtonElement> = async (e) => {
    try {
      await copy(link);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Button
        disabled={uploading}
        variant="contained"
        onClick={handleUpload}
        color="primary"
      >
        {uploading ? <CircularProgress size={"25px"} /> : "Upload"}
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
    </>
  );
};

const GoogleSignInButton = () => {
  // const { cloudService } = useSavedLogsService("google");
  const [authState] = useAuth();
  const [{ instance: cloudService }] = useCloudStorageService();
  const [uploading, setUploading] = useState<boolean>(false);
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
        <div style={{ padding: "20px" }}>
          {/* how to handle uploading? */}
          <FileComponent
            saveFile={cloudService?.saveFile}
            uploading={uploading}
          />
        </div>
      )}
    </>
  );
};

export default GoogleSignInButton;
