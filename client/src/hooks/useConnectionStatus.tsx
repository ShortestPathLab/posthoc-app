import { find } from "lodash";
import { useLoading } from "slices/loading";
import { useSettings } from "slices/settings";
import { useConnectionResolver } from "./useConnectionResolver";

export type ConnectionStatus =
  | "connected"
  | "connecting"
  | "error"
  | "not-connected";

export function useConnectionStatus(url?: string): ConnectionStatus {
  const [{ connections: loading }] = useLoading();
  const resolve = useConnectionResolver();
  const [{ remote }] = useSettings();
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
