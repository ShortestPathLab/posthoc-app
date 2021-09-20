import { getClient } from "client/getClient";
import { useAsyncAbortable as useAsync } from "react-async-hook";
import { useLoading } from "slices/loading";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { PathfindingTask } from "protocol/SolveTask";

export function SpecimenService() {
  const [, setLoading] = useLoading();
  const [, setSpecimen] = useSpecimen();
  const [{ algorithm }] = useUIState();

  useAsync(
    async (signal) => {
      if (algorithm) {
        setLoading({ specimen: true });
        const client = await getClient();
        const params: PathfindingTask["params"] = {
          algorithm,
          end: 0,
          start: 0,
          mapType: "",
          mapURI: "",
        };
        const specimen = await client.call("solve/pathfinding", params);
        if (!signal.aborted) {
          setSpecimen({ specimen, ...params });
          setLoading({ specimen: false });
        }
      }
      return () => setLoading({ specimen: false });
    },
    [algorithm, getClient, setLoading]
  );

  return <></>;
}
