import { isWorkspace, useWorkspace } from "hooks/useWorkspace";
import { now } from "lodash";
import { useAsync } from "react-async-hook";
import { useCloudStorageService } from "slices/cloudStorage";

export function BootstrapService() {
  const { load } = useWorkspace();
//  const [{ instance: cloudService }] = useCloudStorageService();
  useAsync(async () => {
    try {
      const workspace = new URLSearchParams(location.search).get("workspace");
      if (workspace && isWorkspace(workspace)) {
        if (isWorkspace(workspace)) {
          const name = workspace.split("/").pop() ?? workspace;
          const a = await fetch(workspace);
          load(
            new File([await a.blob()], name, { lastModified: now() }),
            new URL(workspace).origin
          );
        }
      } else {
        // if (window.location.hash && cloudService) {
        //   const hashStart = window.location.hash.substring(1).split("?").at(0);
        //   if (hashStart === "fetch-gdrive-file") {
        //     const hashParams = new URLSearchParams(
        //       window.location.hash.substring(1).split("?").at(1)
        //     );
        //     console.log(hashParams.entries);
        //     const fileId = hashParams.get("fileId");
        //     if (!fileId) {
        //       console.log("missing fileId");
        //       return;
        //     }

        //     try {
        //       const file = await cloudService.getFile(fileId);
        //       console.log(file.name);
        //       load(file);
        //     } catch (error) {
        //       console.log(error);
        //     }
        //     window.history.replaceState(null, "", window.location.origin);
        //   }
        // }
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);
  return <></>;
}
