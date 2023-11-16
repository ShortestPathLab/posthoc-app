import { delay, now } from "lodash";
import { useEffect } from "react";
import { getTransport } from "client";
import { useSnackbar } from "components/generic/Snackbar";
import { Connection, useConnections } from "slices/connections";
import { useLoadingState } from "slices/loading";
import { useSettings } from "slices/settings";

function wait(ms: number) {
  return new Promise((res) => delay(res, ms));
}

async function timed<T>(task: () => Promise<T>, ms: number = 2500) {
  const from = now();
  const result = (await Promise.any([task(), wait(ms)])) as T | undefined;
  return { result, delta: now() - from };
}

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
                  call: tp.call.bind(tp),
                  disconnect: tp.disconnect.bind(tp),
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
      cs.map((c) => c.disconnect());
    };
  }, [remote, setConnections, notify, usingLoadingState]);

  return <></>;
}
