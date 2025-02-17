import { useWorkspace } from "hooks/useWorkspace";
import { split } from "lodash";
import { useAsync } from "react-async-hook";
import { useCloudStorageInstance } from "slices/cloudStorage";
import { assert } from "utils/assert";
import { has } from "utils/has";
import { cloudStorageProviders } from ".";

export function BootstrapCloudStorageFileService() {
  const service = useCloudStorageInstance();
  const { load } = useWorkspace();
  useAsync(async () => {
    if (service) {
      const params = new URLSearchParams(new URL(window.location.href).search);
      const workspaceFile = params.get("workspaceFile");
      const [providerId, fileId] = split(workspaceFile, ":");
      assert(fileId, "");
      assert(has(cloudStorageProviders, providerId), "");
      if (service?.instance.id === providerId) {
        load(await service.instance.getFile(fileId));
      }
      window.history.replaceState(null, "", window.location.origin);
    }
  }, [service]);
  return null;
}
