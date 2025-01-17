import { useWorkspace } from "hooks/useWorkspace";
import React, { useEffect } from "react";
import { useCloudStorageService } from "slices/cloudStorage";

export function FetchDriveFileService() {
  const [{ instance: cloudService }] = useCloudStorageService();
  const { load } = useWorkspace();
  useEffect(() => {
    const checkFileLink = async () => {
      if (window.location.hash && cloudService !== undefined) {
        const hashStart = window.location.hash.substring(1).split("?").at(0);
        if (hashStart === "fetch-gdrive-file") {
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1).split("?").at(1)
          );
          console.log(hashParams.entries);
          const fileId = hashParams.get("fileId");
          if (!fileId) {
            console.log("missing fileId");
            return;
          }

          try {
            const file = await cloudService.getFile(fileId);
            const workspace = new URLSearchParams(location.search).get(
              "workspace"
            );

            console.log(file.name);
            load(file);
          } catch (error) {
            console.log(error);
          }
          window.history.replaceState(null, "", window.location.origin);
        }
      }
    };
    checkFileLink();
  }, [cloudService]);
  return <></>;
}
