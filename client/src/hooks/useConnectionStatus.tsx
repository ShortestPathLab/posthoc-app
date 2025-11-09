import { find } from "lodash-es";
import { slice } from "slices";
import { useConnectionResolver } from "./useConnectionResolver";

export type ConnectionStatus =
  | "connected"
  | "connecting"
  | "error"
  | "not-connected";

export function useConnectionsLoading() {
  "use no memo";
  return slice.loading.use((l) => !!l.connections);
}

export function useConnectionStatus(url?: string): ConnectionStatus {
  const loading = useConnectionsLoading();
  const resolve = useConnectionResolver();
  const { remote } = slice.settings.use();
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
