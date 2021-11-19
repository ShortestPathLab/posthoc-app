import { find } from "lodash";
import { useCallback } from "react";
import { useConnections } from "slices/connections";

export function useConnectionResolver() {
  const [connections] = useConnections();
  return useCallback(
    (url?: string) => find(connections, { url }),
    [connections]
  );
}

export function useConnection(url: string) {
  const resolve = useConnectionResolver();
  return resolve(url);
}
