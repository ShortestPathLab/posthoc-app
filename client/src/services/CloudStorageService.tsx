import { Dictionary, once } from "lodash";
import React, { useState, useEffect, useMemo } from "react";
import { useAsync } from "react-async-hook";
import { AuthState, defaultAuthState, useAuth } from "slices/auth";
import { useCloudStorageService } from "slices/cloudStorage";
import { defaultCloudStorage, useSettings } from "slices/settings";

export type FileMetaDataType = {
  fileName: string;
  description?: string;
};

export type AccessToken = unknown;

export type FileMetaData = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size: string;
};

export interface CloudStorageService<K extends string> {
  id: K;
  checkAuth: () => Promise<AuthState>;
  authenticate: () => Promise<void>;
  logout: () => Promise<void>;
  // todo: change the searchTrace to multiple/split files
  saveFile: (
    searchTrace: File,
    fileMetaData?: FileMetaDataType,
    fileId?: string,
  ) => Promise<string>;
  getFile: (fileId: string) => Promise<File>;
  deleteFile: (fileId: string) => Promise<File>;
  generateLink: (fileId: string) => string;
  getSavedFilesMetaData: () => Promise<FileMetaData[]>;
}

function createGoogleStorageService(
  storedToken: string,
  updateState: (newState: AuthState) => Promise<boolean>,
): CloudStorageService<"google"> {
  const scope = "https://www.googleapis.com/auth/drive.file";
  const authLink = "https://accounts.google.com/o/oauth2/v2/auth";
  const googleDriveAPI = "https://www.googleapis.com/drive/v3/files";
  const googleDriveMultiPartUploadLink =
    "https://www.googleapis.com/upload/drive/v3/files";
  const googleFolderMimeType = "application/vnd.google-apps.folder";
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const apiKey = import.meta.env.VITE_API_KEY;
  const id = "google";

  const authenticate = async () => {
    const url = new URL(authLink);
    url.searchParams.append("scope", scope);
    url.searchParams.append("include_granted_scopes", "true");
    url.searchParams.append("response_type", "token");
    url.searchParams.append("state", "testing");
    // todo: conditional logic for prod and dev uris
    url.searchParams.append("redirect_uri", window.location.origin);
    url.searchParams.append("client_id", clientId);
    window.location.href = url.toString();
  };

  const checkAuth = once(() => {
    return new Promise<AuthState>((resolve, reject) => {
      if (window.location.hash) {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );

        const accessToken = hashParams.get("access_token");
        const expiresIn = Number.parseInt(hashParams.get("expires_in") ?? "");
        if (accessToken && !Number.isNaN(expiresIn)) {
          window.history.replaceState(null, "", window.location.origin);
          const today = Date.now();
          resolve({
            authenticated: true,
            accessToken,
            expiredDateTime: today + expiresIn * 1000,
          });
        } else {
          resolve(defaultAuthState);
        }
      } else {
        resolve(defaultAuthState);
      }
    });
  });

  const getAccessToken = async () => {
    if (storedToken) return storedToken;
    return (await checkAuth())?.accessToken;
  };

  const changeVisibility = async (fileId: string) => {
    try {
      const permissionsAPI = `${googleDriveAPI}/${fileId}/permissions`;
      const permissions = {
        role: "reader",
        type: "anyone",
      };
      const result = await fetch(permissionsAPI, {
        method: "POST",
        // mode: 'no-cors',
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
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
  };

  const checkParentFolderExists = async (
    parentName: string,
  ): Promise<string | null> => {
    const folderMimeType = googleFolderMimeType;
    const query = `name = '${parentName}' and mimeType = '${folderMimeType}' and trashed = false`;
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
          query,
        )}&fields=files(id,name)`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
          },
        },
      );

      const data = await response.json();

      if (data.files && data.files.length > 0) {
        console.log("Folder exists:", data.files[0].name);
        return data.files[0].id;
      } else {
        // console.log("Folder does not exist");
        return null;
      }
    } catch (error) {
      // console.error("Error checking folder existence:", error);
      return null;
    }
  };

  const createFolder = async (folderName: string) => {
    // todo: better way to confirm parent folder existence
    // * folder name can be pre-existing
    const id = await checkParentFolderExists(folderName);
    if (id) {
      return id;
    }
    try {
      const folderMetaData = {
        name: folderName,
        mimeType: googleFolderMimeType,
      };
      const response = await fetch(`${googleDriveAPI}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify(folderMetaData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          updateState(defaultAuthState);
        }
        throw new Error("Failed to create parent folder.");
      }

      const data = await response.json();
      // ? would not having the res stored not catch error?
      await changeVisibility(data.id);

      return data.id;
    } catch (error) {
      console.log(error);
      throw new Error("Error while creating a new folder");
    }
  };

  const getFile = async (fileId: string) => {
    try {
      const [metadataResponse, mediaResponse] = await Promise.all([
        fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?key=${apiKey}`,
        ),
        fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`,
        ),
      ]);
      const metadata = await metadataResponse.json();
      const fileName = metadata.name;
      const lastModified = metadata.modifiedTime;
      if (!metadataResponse.ok || !mediaResponse.ok) {
        throw new Error("Unable to get file");
      }
      const fileContent = await mediaResponse.blob();
      const file = new File([fileContent], fileName, {
        lastModified: new Date(lastModified).getTime(),
      });
      return file;
    } catch (error) {
      console.log(error);
      throw new Error("Unable to get file");
    }
  };

  const saveFile = async (file: File) => {
    try {
      const parentId = await createFolder("post-hoc-files");
      const fileMetaData = {
        name: file.name,
        parents: [parentId],
      };
      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(fileMetaData)], { type: "application/json" }),
      );
      form.append("file", file);
      const response = await fetch(
        `${googleDriveMultiPartUploadLink}?uploadType=multipart`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
          },
          body: form,
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to save file: ${await response.text()}`);
      }

      const data = await response.json();
      //   console.log("File created successfully:", data);
      const publicURL = data.id;
      return publicURL;
    } catch (error) {
      console.log("Error uploading file: ", error);
      throw new Error("Failed to save file");
    }
  };

  const getFolderIdByName = async (folderName: string) => {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${folderName}'+and+mimeType='application/vnd.google-apps.folder'&fields=files(id,name)`,
      {
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`, // Pass the access token here
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error finding folder: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.files.length === 0) {
      throw new Error("No folder found with the specified name.");
    }

    return data.files[0].id; // Return the first folder's ID
  };

  const getSavedFilesMetaData = async () => {
    // * change this to a global var
    try {
      const folderName = "post-hoc-files";
      const folderId = await getFolderIdByName(folderName);

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType,modifiedTime,size)`,
        {
          headers: {
            Authorization: `Bearer ${await getAccessToken()}`, // Pass the access token here
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Error fetching files: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files; // Return file metadata    } catch (error) {
    } catch (error) {
      console.log(error);
    }
  };

  const generateLink = (fileId: string) => {
    return `${window.location.origin}?workspaceFile=${id}:${fileId}`;
  };

  const logout = async () => { };

  return {
    id,
    checkAuth,
    authenticate,
    logout,
    saveFile,
    getFile,
    getSavedFilesMetaData,
    generateLink,
  };
}

type ProviderFactory<K extends string, A extends AccessToken = unknown> = (
  accessToken: A,
  updateState: (newState: AuthState) => Promise<boolean>,
) => CloudStorageService<K>;

export const providers = {
  google: createGoogleStorageService,
  // github: createGoogleStorageService,
} satisfies { [K in string]: ProviderFactory<K, any> };

export function CloudStorageService() {
  const [, setCloudStorageService] = useCloudStorageService();
  const [{ cloudStorageType = defaultCloudStorage }] = useSettings();
  const [authState, setAuthState] = useAuth();
  const cloudService = useMemo(() => {
    if (!(cloudStorageType in providers)) {
      throw new Error("Invalid Provider");
    }

    const token = authState.accessToken;
    const update = async (newState: AuthState) => {
      try {
        setAuthState(() => newState);
        return true;
      } catch (error) {
        // * handle errors here
        // console.log(error);
        return false;
      }
    };
    return providers[cloudStorageType](token as any, update);
  }, [cloudStorageType, authState.accessToken]);

  useAsync(async () => {
    try {
      const res = await cloudService.checkAuth();
      setAuthState((authState) => {
        const now = Date.now();

        if (
          authState?.authenticated &&
          authState.expiredDateTime &&
          authState.expiredDateTime < now
        ) {
          return res?.accessToken ? res : defaultAuthState;
        }
        return res?.accessToken ? res : authState || defaultAuthState;
      });
    } catch (error) {
      console.error("Auth error:", error);
    }
  }, [cloudService]);

  useEffect(() => {
    setCloudStorageService(() => ({
      instance: cloudService,
    }));
  }, [cloudService]);

  return <></>;
}
