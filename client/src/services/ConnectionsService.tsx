import { getTransport } from "client";
import { useSnackbar } from "components/generic/Snackbar";
import { delay, now } from "lodash";
import { useEffect } from "react";
import { Connection, useConnections } from "slices/connections";
import { useLoadingState } from "slices/loading";
import { useSettings } from "slices/settings";

function wait(ms: number) {
  return new Promise((res) => delay(res, ms));
}

async function timed<T>(task: () => Promise<T>, ms: number = 5000) {
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
    const cs: Connection[] = [];
    usingLoadingState(async () => {
      notify("Connecting...");
      for (const { transport: t, url, disabled } of remote ?? []) {
        if (!disabled) {
          const tp = new (getTransport(t))({ url });
          await tp.connect();
          const { result, delta } = await timed(() => tp.call("about"));
          if (result) {
            cs.push({
              ...result,
              url,
              ping: delta,
              call: tp.call.bind(tp),
              disconnect: tp.disconnect.bind(tp),
            });
          } else await tp.disconnect();
        }
        if (!aborted) setConnections(cs);
      }
      if (!aborted) notify(`Connected to ${cs.length} of ${remote?.length}.`);
    });
    return () => {
      aborted = true;
      cs.map((c) => c.disconnect());
    };
  }, [remote, setConnections, notify, usingLoadingState]);

  return <></>;
}
