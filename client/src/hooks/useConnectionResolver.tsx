import { find } from "lodash";
import { useCallback } from "react";
import { Connection, useConnections } from "slices/connections";

export function useConnectionResolver() {
  const [connections] = useConnections();
  return useCallback(
    (model?: Partial<Connection>) => find(connections, model),
    [connections]
  );
}

export function useConnection(url: string) {
  const resolve = useConnectionResolver();
  return resolve({ url });
}
