import { getClient } from "client/getClient";
import Controller from "old/controller";
import Store from "old/services/store";
import { useAsyncAbortable as useAsync } from "react-async-hook";
import { useUIState } from "slices/UIState";

export function SearchTraceViewer() {
  const [{ algorithm }] = useUIState();
  useAsync(
    async (signal) => {
      if (algorithm) {
        const client = await getClient();
        const trace = await client.call("solve/pathfinding", { algorithm });
        if (!signal.aborted) {
          // TODO Unsure if the following code is correct
          Store.createRecord("Tracer", trace);
          Controller.start();
        }
      }
    },
    [algorithm, getClient]
  );
  // TODO Return actual search trace viewer
  // Currently updates legacy viewer properties
  return <></>;
}
