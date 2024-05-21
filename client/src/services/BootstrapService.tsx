import { isWorkspace, useWorkspace } from "hooks/useWorkspace";
import { now } from "lodash";
import { useAsync } from "react-async-hook";

export function BootstrapService() {
  const { load } = useWorkspace();
  useAsync(async () => {
    try {
      const param = new URLSearchParams(location.search).get("workspace");
      if (param) {
        const workspace = decodeURIComponent(param);
        if (isWorkspace(workspace)) {
          const name = workspace.split("/").pop() ?? workspace;
          const a = await fetch(workspace);
          load(new File([await a.blob()], name, { lastModified: now() }));
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);
  return <></>;
}
