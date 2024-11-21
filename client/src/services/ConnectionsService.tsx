import { getTransport } from "client";
import { useSnackbar } from "components/generic/Snackbar";
import { useEffect } from "react";
import { Connection, useConnections } from "slices/connections";
import { useLoadingState } from "slices/loading";
import { useSettings } from "slices/settings";
import { timed } from "utils/timed";

export function ConnectionsService() {
  const notify = useSnackbar();
  const [{ remote }] = useSettings();
  const [, setConnections] = useConnections();
  const usingLoadingState = useLoadingState("connections");

  useEffect(() => {
    let aborted = false;
    let cs: Connection[] = [];
    usingLoadingState(async () => {
      if (remote?.length) {
        for (const { transport: t, url, disabled } of remote) {
          // Truthy value includes undefined
          if (disabled !== true) {
            notify(`Connecting to ${url}...`);
            const tp = new (getTransport(t))({ url });
            await tp.connect();
            const { result, delta } = await timed(() => tp.call("about"));
            if (result) {
              notify(`Connected to ${result.name}`);
              cs = [
                ...cs,
                {
                  ...result,
                  url,
                  ping: delta,
                  transport: () => tp,
                },
              ];
            } else await tp.disconnect();
          }
          if (!aborted) setConnections(() => cs);
        }
        if (!aborted)
          notify(`Connected to ${cs.length} of ${remote.length} solvers`);
      }
    });
    return () => {
      aborted = true;
      cs.map((c) => c.transport().disconnect());
    };
  }, [JSON.stringify(remote), setConnections, notify, usingLoadingState]);

  return <></>;
}
