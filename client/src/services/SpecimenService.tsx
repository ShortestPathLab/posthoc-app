import { getClient } from "client/getClient";
import { getRenderer } from "components/specimen-renderer/getRenderer";
import { ParamsOf } from "protocol/Message";
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
  const [{ algorithm, map, startNode, endNode }, setUIState] = useUIState();

  useAsync(
    async (signal) => {
      setLoading({ specimen: true });
      if (algorithm && map?.id && map?.type) {
        const mapURI = await getMap(map.id);
        if (mapURI) {
          const client = await getClient();
          const [, defaults] = getRenderer(map.type);
          const params: ParamsOf<PathfindingTask> = {
            algorithm,
            end: endNode ?? defaults(mapURI)?.end,
            start: startNode ?? defaults(mapURI)?.start,
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
    [algorithm, startNode, endNode, map?.id, map?.type, getClient, setLoading]
  );

  return <></>;
}
