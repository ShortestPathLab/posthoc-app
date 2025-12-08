import { find } from "lodash-es";
import { slice } from "slices";
import { useConnectionResolver } from "./useConnectionResolver";
import { useOne } from "slices/useOne";

export type ConnectionStatus =
  | "connected"
  | "connecting"
  | "error"
  | "not-connected";

export function useConnectionsLoading() {
  return useOne(slice.loading, (l) => !!l.connections);
}

export function useConnectionStatus(url?: string): ConnectionStatus {
  const loading = useConnectionsLoading();
  const resolve = useConnectionResolver();
  const { remote } = useOne(slice.settings);
  const entry = find(remote, { url });

  return entry && !entry?.disabled
    ? resolve({ url })
      ? "connected"
      : loading
        ? "connecting"
        : url
          ? "error"
          : "not-connected"
    : "not-connected";
}
