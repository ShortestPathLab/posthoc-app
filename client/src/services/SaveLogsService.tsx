/// <reference types="gapi" />
import React, { useState, useEffect } from "react";
// req for Service interface
// send /update the file
// get a file
// get list of file data
// delete a file

interface AuthType {
  name: string;
  email: string;
}

export interface Service {
  checkAuth: () => boolean;
  sendFile: (file: File) => Promise<boolean>;
  authenticate: () => Promise<void>;
}

export function useSavedLogsService(cloudService: Service) {
  const [loading, setLoading] = useState<boolean>(false);
  const [auth, setAuth] = useState<boolean>(false);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = cloudService.checkAuth();
        console.log(res)
        setAuth(res);
        // find some way to check for existing auth
      } catch (error) {
        console.log(error);
        // todo: handle auth error here
      }
    };
    checkAuth();
  }, []);
  return {
    auth,
    authenticate: cloudService.authenticate,
    sendFile: cloudService.sendFile,
  };
}
