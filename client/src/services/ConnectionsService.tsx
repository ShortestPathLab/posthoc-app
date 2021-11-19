import { getTransport } from "client/getTransport";
import { useSnackbar } from "components/generic/Snackbar";
import { delay, now } from "lodash";
import { useAsyncAbortable as useAsync } from "react-async-hook";
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

  useAsync(
    (signal) =>
      usingLoadingState(async () => {
        notify("Connecting...");
        const connections: Connection[] = [];
        for (const { transport: t, url, disabled } of remote ?? []) {
          if (!disabled) {
            const transport = new (getTransport(t))({ url });
            await transport.connect();
            const { result, delta } = await timed(() =>
              transport.call("about")
            );
            if (result) {
              connections.push({
                ...result,
                url,
                call: (n, p) => transport.call(n, p),
                ping: delta,
              });
            } else await transport.disconnect();
          }
          if (!signal.aborted) setConnections(connections);
        }
        if (!signal.aborted)
          notify(
            `Connected to ${connections.length} of ${remote?.length} solvers.`
          );
      }),
    [remote, setConnections]
  );

  return <></>;
}
