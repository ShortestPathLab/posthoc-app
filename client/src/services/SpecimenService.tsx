import { getClient } from "client/getClient";
import {
  SnackbarLabel as Label,
  useSnackbar,
} from "components/generic/Snackbar";
import { getRenderer } from "components/specimen-renderer/getRenderer";
import { memoize as memo } from "lodash";
import md5 from "md5";
import { ParamsOf } from "protocol/Message";
import { PathfindingTask } from "protocol/SolveTask";
import { useAsyncAbortable as useAsync } from "react-async-hook";
import { useLoading } from "slices/loading";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";

const hash = memo(md5);

const getMap = memo(async (map: string) => {
  const client = await getClient();
  return (await client.call("features/map", { id: map }))?.content;
});

async function solve(
  map: string,
  params: Omit<ParamsOf<PathfindingTask>, "mapURI">
) {
  const client = await getClient();
  if (map) {
    for (const mapURI of [
      `hash:${hash(map)}`,
      `map:${encodeURIComponent(map)}`,
    ] as const) {
      const p = { ...params, mapURI };
      const specimen = await client.call("solve/pathfinding", p);
      if (specimen) return { ...p, specimen, map };
    }
  }
}

export function SpecimenService() {
  const notify = useSnackbar();
  const [, setLoading] = useLoading();
  const [, setSpecimen] = useSpecimen();
  const [{ algorithm, map, start, end }, setUIState] = useUIState();

  useAsync(
    async (signal) => {
      setLoading({ specimen: true });
      if (algorithm && map?.id && map?.type) {
        const m = await getMap(map.id);
        if (m) {
          const [, defaults] = getRenderer(map.type);
          try {
            const solution = await solve(m, {
              algorithm,
              end: end ?? defaults(m)?.end,
              start: start ?? defaults(m)?.start,
              mapType: map?.type,
            });
            if (solution && !signal.aborted) {
              setSpecimen(solution);
              setUIState({ step: 0, playback: "paused", breakpoints: [] });
              notify(
                <Label
                  primary="Solution generated."
                  secondary={`${solution.specimen.eventList?.length} steps`}
                />
              );
            }
          } catch (e) {
            notify(`${e}`);
          }
        }
      }
      setLoading({ specimen: false });
    },
    [algorithm, start, end, map?.id, map?.type, getClient, setLoading, notify]
  );

  return <></>;
}
