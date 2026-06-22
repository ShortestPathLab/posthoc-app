import { find } from "es-toolkit/compat";
import { useCallback } from "react";
import { slice } from "slices";
import { Connection } from "slices/connections";
import { useOne } from "slices/useOne";

export function useConnectionResolver() {
  const connections = useOne(slice.connections);
  return useCallback((model?: Partial<Connection>) => find(connections, model), [connections]);
}

export function useConnection(url: string) {
  const resolve = useConnectionResolver();
  return resolve({ url });
}
