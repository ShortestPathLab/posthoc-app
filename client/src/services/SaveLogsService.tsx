import { Dictionary } from "lodash";
import React, { useState, useEffect, useMemo } from "react";
import { useSettings } from "slices/settings";

type FileMetaDataType = {
  fileName: string;
  description?: string;
};

// type CloudServiceError{
  
// }

export interface CloudStorageService {
  checkAuth: () => Promise<boolean>;
  authenticate: () => Promise<void>;
  createFolder: (folderName: string, id?: string) => Promise<string | CloudServiceError>;
  sendFile: (
    searchTrace: File,
    fileMetaData: FileMetaDataType,
    mapObject?: File,
    fileId?: string,
    parentId?: string
  ) => Promise<string>;
  getFile: () => Promise<File>;
}

class GoogleCloudService implements CloudStorageService {
  private apiKey = import.meta.env.VITE_API_KEY;
  private clientId = import.meta.env.VITE_CLIENT_ID;
  private scope = "https://www.googleapis.com/auth/drive.file";
  private authLink = "https://accounts.google.com/o/oauth2/v2/auth";
  private googleDriveAPI = "https://www.googleapis.com/drive/v3/files";
  private googleDriveMultiPartUploadLink =
    "https://www.googleapis.com/upload/drive/v3/files";
  private accessToken: string | null = null;

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
  }

  checkAuth() {
    return new Promise<boolean>((resolve, reject) => {
      if (window.location.hash) {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );

        const accessToken = hashParams.get("access_token");

        if (accessToken) {
          this.accessToken = accessToken;
          window.history.replaceState(null, "", window.location.origin);
        } else {
          console.log("Access token not found in URL.");
        }
      }
      if (this.accessToken === null) reject(false);
      else resolve(true);
    });
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

      return `https://drive.google.com/uc?export=download&id=${fileId}`;
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
        return "";
      }
    } catch (error) {
      console.error("Error checking folder existence:", error);
      return "";
    }
  }

  async createFolder(folderName) {
    // todo: better way to confirm parent folder existence
    const parentName = "posthoc-trace-files";
    const id = await this.checkParentFolderExists(folderName);
    if (id !== "") {
      return id;
    }
    try {
      const folderMetaData = {
        name: folderName,
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

  async getFile() {
    return;
  }
  async sendFile(file: File) {
    try {
      const parentId = await this.createFolder();
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

      // todo: change to id
      const publicURL = data.id;
      return publicURL;
      // const publicURL = await this.changeVisibility(data.id);
    } catch (error) {
      console.log("Error uploading file: ", error);
      return "";
    }
  }
}

const providers: Dictionary<new () => CloudStorageService> = {
  google: GoogleCloudService,
};

export function useSavedLogsService(cloudServiceType: "google" | "github") {
  const cloudService = useMemo(
    () => new providers[cloudServiceType](),
    [cloudServiceType]
  );
  const [uploading, setUploading] = useState<boolean>(false);
  const [auth, setAuth] = useState<boolean>(false);
  const [settings, setSettings] = useSettings();
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await cloudService.checkAuth();
        setAuth(res);
        // todo: find some way to check for existing auth
      } catch (error) {
        console.log(error);
        // todo: handle auth error here
      }
    };
    checkAuth();
  }, []);
  const sendFile = async (file: File) => {
    setUploading(true);
    const res = await cloudService.sendFile(file, { fileName: "test.yaml" });
    setUploading(false);
    return res;
  };
  return {
    auth,
    cloudService,
  };
}
