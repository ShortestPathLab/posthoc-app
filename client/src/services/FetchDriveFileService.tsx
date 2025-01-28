import { useWorkspace } from "hooks/useWorkspace";
import { useEffect } from "react";
import { useCloudStorageService } from "slices/cloudStorage";
import { providers } from "./CloudStorageService";

export function FetchDriveFileService() {
  const [{ instance: cloudService }] = useCloudStorageService();
  const { load } = useWorkspace();
  useEffect(() => {
    const checkFileLink = async () => {
      const params = new URLSearchParams(new URL(window.location.href).search);
      const workspaceFile = params.get("workspaceFile");
      if (!workspaceFile) {
        return;
      }
      const [providerType, fileId] = workspaceFile.split(":");
      if (providerType && fileId) {
        const cloudService = providers[providerType as keyof typeof providers](
          "",
          async () => true
        );
        if (!fileId) {
          return;
        }

        try {
          const file = await cloudService.getFile(fileId);

          load(file);
        } catch {
          // console.log(error)
        }
        window.history.replaceState(null, "", window.location.origin);
      }
    };
    checkFileLink();
  }, [cloudService]);
  return <></>;
}
