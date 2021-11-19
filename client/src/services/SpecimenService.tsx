import { Transport } from "client/Transport";
import { Label } from "components/generic/Label";
import { useSnackbar } from "components/generic/Snackbar";
import { getRenderer } from "components/specimen-renderer/getRenderer";
import { useConnectionResolver } from "hooks/useConnectionResolver";
import { find, memoize as memo } from "lodash";
import md5 from "md5";
import { ParamsOf } from "protocol/Message";
import { PathfindingTask } from "protocol/SolveTask";
import { useAsyncAbortable as useAsync } from "react-async-hook";
import { useFeatures } from "slices/features";
import { useLoadingState } from "slices/loading";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { useMapContent } from "../hooks/useMapContent";

const hash = memo(md5);

async function solve(
  map: string,
  params: Omit<ParamsOf<PathfindingTask>, "mapURI">,
  call: Transport["call"]
) {
  if (map) {
    for (const mapURI of [
      `hash:${hash(map)}`,
      `map:${encodeURIComponent(map)}`,
    ] as const) {
      const p = { ...params, mapURI };
      const specimen = await call("solve/pathfinding", p);
      if (specimen) return { ...p, specimen, map };
    }
  }
}

export function SpecimenService() {
  const usingLoadingState = useLoadingState("specimen");
  const notify = useSnackbar();
  const [{ mapType }] = useFeatures();
  const [{ algorithm, map, start, end }, setUIState] = useUIState();
  const resolve = useConnectionResolver();
  const [, setSpecimen] = useSpecimen();

  const { result: mapContent } = useMapContent();

  useAsync(
    (signal) =>
      usingLoadingState(async () => {
        if (algorithm && map && map.type && mapContent) {
          const [, defaults] = getRenderer(map.type);
          try {
            const type = find(mapType, { id: map.type });
            if (type) {
              const connection = resolve(type.source);
              if (connection) {
                const solution = await solve(
                  mapContent,
                  {
                    algorithm,
                    end: end ?? defaults(mapContent)?.end,
                    start: start ?? defaults(mapContent)?.start,
                    mapType: map.type,
                  },
                  connection.call
                );
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
              }
            } else
              notify(
                `No solver is available for the map format (${map.type}).`
              );
          } catch (e) {
            notify(`${e}`);
          }
        }
      }),
    [
      algorithm,
      start,
      end,
      map,
      notify,
      usingLoadingState,
      mapType,
      mapContent,
      resolve,
      setSpecimen,
    ]
  );

  return <></>;
}
