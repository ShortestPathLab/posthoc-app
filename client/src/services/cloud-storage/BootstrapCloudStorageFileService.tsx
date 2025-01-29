import { useWorkspace } from "hooks/useWorkspace";
import { useEffect } from "react";
import { useCloudStorageService } from "slices/cloudStorage";
import { cloudStorageProviders } from ".";
import { has } from "utils/has";
import { split } from "lodash";

export function BootstrapCloudStorageFileService() {
  const [{ instance: cloudService }] = useCloudStorageService();
  const { load } = useWorkspace();
  useEffect(() => {
    const checkFileLink = async () => {
      const params = new URLSearchParams(new URL(window.location.href).search);
      const workspaceFile = params.get("workspaceFile");
      const [providerType, fileId] = split(workspaceFile, ":");

      if (!providerType || !fileId || !has(cloudStorageProviders, providerType))
        return;

      const cloudService = cloudStorageProviders[providerType].create(
        "",
        async () => true
      );

      try {
        const file = await cloudService.getFile(fileId);
        load(file);
      } catch {
        /* empty */
      }
      window.history.replaceState(null, "", window.location.origin);
    };
    checkFileLink();
  }, [cloudService]);
  return null;
}
