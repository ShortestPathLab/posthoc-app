import { getClient } from "client/getClient";
import { PathfindingTask } from "protocol/SolveTask";
import { useAsyncAbortable as useAsync } from "react-async-hook";
import { useLoading } from "slices/loading";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";

async function getMap(map: string) {
  const client = await getClient();
  return (await client.call("features/map", { id: map }))?.content;
}

export function SpecimenService() {
  const [, setLoading] = useLoading();
  const [, setSpecimen] = useSpecimen();
  const [{ algorithm, map }, setUIState] = useUIState();

  useAsync(
    async (signal) => {
      setLoading({ specimen: true });
      if (algorithm && map?.id && map?.type) {
        const mapURI = await getMap(map.id);
        if (mapURI) {
          const client = await getClient();
          const params: PathfindingTask["params"] = {
            algorithm,
            end: 0,
            start: 0,
            mapType: map?.type,
            mapURI,
          };
          const specimen = await client.call("solve/pathfinding", params);
          if (!signal.aborted) {
            setSpecimen({ specimen, ...params });
            setUIState({ step: 0, playback: "paused", breakpoints: [] });
          }
        }
      }
      setLoading({ specimen: false });
    },
    [algorithm, map?.id, map?.type, getClient, setLoading]
  );

  return <></>;
}
