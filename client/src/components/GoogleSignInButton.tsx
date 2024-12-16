/// <reference types="google.accounts" />
import { IconButton, Input, Typography } from "@mui/material";
import { Service, useSavedLogsService } from "services/SaveLogsService";
import GoogleIcon from "@mui/icons-material/Google";
import { Button } from "./generic/Button";
import { useRef, useState } from "react";
import { result } from "lodash";

class GoogleCloudService implements Service {
  private apiKey = import.meta.env.VITE_API_KEY;
  private clientId = import.meta.env.VITE_CLIENT_ID;
  private scope = "https://www.googleapis.com/auth/drive.file";
  private authLink = "https://accounts.google.com/o/oauth2/v2/auth";
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

    // * using oauth lib
    // this.initClient()
  }

  checkAuth() {
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      const accessToken = hashParams.get("access_token");

      if (accessToken) {
        console.log("Access Token:", accessToken);
        this.accessToken = accessToken;
        console.log(this.accessToken);
        window.history.replaceState(null, "", window.location.origin);
      } else {
        console.log("Access token not found in URL.");
      }
    }
    console.log(this.accessToken);
    return this.accessToken === null ? false : true;
  }
  async changeVisibility(fileId: string) {
    try {
      const permissionsAPI = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`;
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
  async sendFile(file: File) {
    try {
      const fileMetaData = {
        name: file.name,
        permissions: {
          role: "reader",
          type: "anyone",
        },
      };
      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(fileMetaData)], { type: "application/json" })
      );
      form.append("file", file);
      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: form,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create file: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("File created successfully:", data);

      // const publicURL = `https://drive.google.com/file/d/${data.id}/view?usp=sharing`;
      const publicURL = await this.changeVisibility(data.id);
      console.log(publicURL);
      return data;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
    return true;
  }
}

const GoogleSignInButton = () => {
  const gService = new GoogleCloudService();
  const { auth, authenticate, sendFile } = useSavedLogsService(gService);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  console.log(auth);
  const handleUpload = async () => {
    try {
      if (selectedFile) {
        const res = await sendFile(selectedFile);
      } else {
        alert("Please select a file first");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };
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
            <Button variant="contained" component="span">
              Choose File
            </Button>
          </label>

          {fileName && (
            <Typography variant="body1" style={{ marginTop: "10px" }}>
              Selected file: {fileName}
            </Typography>
          )}

          <div style={{ marginTop: "20px" }}>
            <Button variant="contained" onClick={handleUpload} color="primary">
              Upload
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleSignInButton;
