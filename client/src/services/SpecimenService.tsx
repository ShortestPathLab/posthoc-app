import { getClient } from "client/getClient";
import { useAsyncAbortable as useAsync } from "react-async-hook";
import { useLoadingState } from "slices/loadingState";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";

export function SpecimenService() {
  const [, setLoading] = useLoadingState();
  const [, setSpecimen] = useSpecimen();
  const [{ algorithm }] = useUIState();

  useAsync(
    async (signal) => {
      if (algorithm) {
        setLoading({ specimen: true });
        const client = await getClient();
        const trace = await client.call("solve/pathfinding", {
          algorithm,
          end: 0,
          start: 0,
          mapType: "",
          mapURI: "",
        });
        if (!signal.aborted) {
          setSpecimen(trace);
          setLoading({ specimen: false });
        }
      }
      return () => setLoading({ specimen: false });
    },
    [algorithm, getClient, setLoading]
  );

  return <></>;
}
