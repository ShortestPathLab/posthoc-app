import React, { useState, useEffect } from "react";


export interface Service {
  checkAuth: () => boolean;
  sendFile: (file: File) => Promise<string>;
  authenticate: () => Promise<void>;
}

export interface SavedLogsServiceHook extends Service {
  auth: boolean;
  uploading: boolean;
}

export function useSavedLogsService(
  cloudService: Service
): SavedLogsServiceHook {
  const [uploading, setUploading] = useState<boolean>(false);
  const [auth, setAuth] = useState<boolean>(false);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = cloudService.checkAuth();
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
    const res = await cloudService.sendFile(file);
    setUploading(false);
    return res;
  };
  return {
    auth,
    checkAuth: cloudService.checkAuth,
    authenticate: cloudService.authenticate,
    sendFile,
    uploading,
  };
}
