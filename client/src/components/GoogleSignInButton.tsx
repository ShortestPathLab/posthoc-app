/// <reference types="google.accounts" />
import {
  CircularProgress,
  IconButton,
  Input,
  TextField,
  Typography,
} from "@mui/material";
import { Service, useSavedLogsService } from "services/SaveLogsService";
import GoogleIcon from "@mui/icons-material/Google";
import { Button } from "./generic/Button";
import { MouseEventHandler, useRef, useState } from "react";
import { result } from "lodash";

const FileComponent = ({
  sendFile,
  uploading,
}: {
  uploading: ;
  sendFile: SavedLogsServiceHook["sendFile"];
}) => {
  const [fileName, setFileName] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [link, setLink] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };
  const handleUpload = async () => {
    try {
      if (selectedFile) {
        const res = await sendFile(selectedFile);
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

  const handleCopy: MouseEventHandler<HTMLButtonElement> = (e) => {
    console.log(link);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        File Upload
      </Typography>

      <Input
        type="file"
        inputProps={{
          accept: ".yaml",
        }}
        id="file-input"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <label htmlFor="file-input">
        <Button disabled={uploading} variant="contained" component="span">
          Choose File
        </Button>
      </label>

      {fileName && (
        <Typography variant="body1" style={{ marginTop: "10px" }}>
          Selected file: {fileName}
        </Typography>
      )}

      <div style={{ marginTop: "20px" }}>
        <Button
          disabled={uploading}
          variant="contained"
          onClick={handleUpload}
          color="primary"
        >
          {uploading ? <CircularProgress size={"25px"} /> : "Upload"}
        </Button>
      </div>
      {link !== "" && (
        <div style={{ margin: "20px" }}>
          <TextField
            value={link}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCopy}
            style={{ marginTop: "10px" }}
          >
            Copy Text
          </Button>
        </div>
      )}
    </>
  );
};

const GoogleSignInButton = () => {
  const { auth, cloudService } = useSavedLogsService("google");

  return (
    <>
      <Typography variant="body2" align="center" color="text.secondary">
        Login with Google to save and share your search traces
      </Typography>
      {!auth ? (
        <IconButton
          onClick={cloudService.authenticate}
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
          <FileComponent sendFile={cloudService.sendFile} uploading={uploading} />
        </div>
      )}
    </>
  );
};

export default GoogleSignInButton;
