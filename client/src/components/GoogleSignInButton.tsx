/// <reference types="google.accounts" />
import {
  CircularProgress,
  IconButton,
  Input,
  TextField,
  Typography,
} from "@mui/material";
import {
  SavedLogsServiceHook,
  Service,
  useSavedLogsService,
} from "services/SaveLogsService";
import GoogleIcon from "@mui/icons-material/Google";
import { Button } from "./generic/Button";
import { MouseEventHandler, useRef, useState } from "react";
import { result } from "lodash";

class GoogleCloudService implements Service {
  private apiKey = import.meta.env.VITE_API_KEY;
  private clientId = import.meta.env.VITE_CLIENT_ID;
  private scope = "https://www.googleapis.com/auth/drive.file";
  private authLink = "https://accounts.google.com/o/oauth2/v2/auth";
  private googleDriveAPI = "https://www.googleapis.com/drive/v3/files";
  private googleDriveMultiPartUploadLink = "https://www.googleapis.com/upload/drive/v3/files"
  private accessToken: string | null = null;

  // ? switch to arrow functions?
  constructor() {
    this.authenticate = this.authenticate.bind(this);
    this.initClient = this.initClient.bind(this);
    this.sendFile = this.sendFile.bind(this);
    this.checkAuth = this.checkAuth.bind(this);
  }

  private initClient() {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: this.scope,
      callback: (response) => {
        console.log(response.access_token);
      },
      error_callback: (error) => {
        console.log(error);
        console.log(error.cause);
        console.log(error.stack);
      },
    });
    try {
      client.requestAccessToken();
    } catch (error) {
      console.log(error);
    }
  }

  async authenticate() {
    // using manual auth flow
    const url = new URL(this.authLink);

    // Append query parameters
    url.searchParams.append("scope", this.scope);
    url.searchParams.append("include_granted_scopes", "true");
    url.searchParams.append("response_type", "token");
    url.searchParams.append("state", "testing");
    // todo: conditional logic for prod and dev uris
    url.searchParams.append("redirect_uri", window.location.origin);
    url.searchParams.append("client_id", this.clientId);
    window.location.href = url.toString();

    // * using oauth lib (to debug)
    // this.initClient()
  }

  checkAuth() {
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      const accessToken = hashParams.get("access_token");

      if (accessToken) {
        this.accessToken = accessToken;
        window.history.replaceState(null, "", window.location.origin);
      } else {
        console.log("Access token not found in URL.");
      }
    }
    return this.accessToken === null ? false : true;
  }
  async changeVisibility(fileId: string) {
    try {
      const permissionsAPI = `${this.googleDriveAPI}/${fileId}/permissions`;
      const permissions = {
        role: "reader",
        type: "anyone",
      };
      const result = await fetch(permissionsAPI, {
        method: "POST",
        // mode: 'no-cors',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(permissions),
      });
      if (!result.ok) {
        throw new Error("Failed to set permissions");
      }

      console.log("File is now publicly accessible");

      return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
      // gapi.client.request.
    } catch (error) {
      console.log(error);
      throw new Error("Error while setting permssions");
    }
  }
  private async checkParentFolderExists(parentName: string) {
    const folderMimeType = "application/vnd.google-apps.folder";
    const query = `name = '${parentName}' and mimeType = '${folderMimeType}' and trashed = false`;
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
          query
        )}&fields=files(id,name)`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.files && data.files.length > 0) {
        console.log("Folder exists:", data.files[0].name);
        return data.files[0].id;
      } else {
        console.log("Folder does not exist");
        return false;
      }
    } catch (error) {
      console.error("Error checking folder existence:", error);
      return "";
    }
  }
  private async createParentFolder() {
    // todo: better way to confirm parent folder existence
    const parentName = "posthoc-trace-files";
    const id = await this.checkParentFolderExists(parentName);
    if (id !== "") {
      return id;
    }
    try {
      const folderMetaData = {
        name: parentName,
        mimeType: "application/vnd.google-apps.folder",
      };
      const response = await fetch(`${this.googleDriveAPI}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(folderMetaData),
      });
      if (!response.ok) {
        throw new Error("Failed to create parent folder.");
      }

      const data = await response.json();
      const res = this.changeVisibility(data.id);

      return data.id;
    } catch (error) {
      console.log(error);
      throw new Error("Error while creating a new folder");
    }
  }
  async sendFile(file: File) {
    try {
      const parentId = await this.createParentFolder();
      const fileMetaData = {
        name: file.name,
        parents: [parentId],
      };
      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(fileMetaData)], { type: "application/json" })
      );
      form.append("file", file);
      const response = await fetch(
        `${this.googleDriveMultiPartUploadLink}?uploadType=multipart`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: form,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create file: ${await response.text()}`);
      }

      const data = await response.json();
      console.log("File created successfully:", data);

      const publicURL = `https://drive.google.com/file/d/${data.id}/view?usp=sharing`;
      return publicURL;
      // const publicURL = await this.changeVisibility(data.id);
    } catch (error) {
      console.log("Error uploading file: ", error);
      return "";
    }
  }
}

const FileComponent = ({
  sendFile,
  uploading,
}: {
  uploading: SavedLogsServiceHook["uploading"];
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
            : `${window.location.origin}/#fetch-gdrive-file?link=${res}`
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
  const gService = new GoogleCloudService();
  const { auth, authenticate, sendFile, uploading } =
    useSavedLogsService(gService);

  return (
    <>
      <Typography variant="body2" align="center" color="text.secondary">
        Login with Google to save and share your search traces
      </Typography>
      {!auth ? (
        <IconButton
          onClick={authenticate}
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
          <FileComponent sendFile={sendFile} uploading={uploading} />
        </div>
      )}
    </>
  );
};

export default GoogleSignInButton;
