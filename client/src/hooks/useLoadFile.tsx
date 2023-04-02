import { parseGridMap } from "components/render/renderer/generic/MapParser";
import { parseViews } from "components/render/parser/Parser";
import { Specimen, useSpecimen } from "slices/specimen";
import { useSnackbar } from "components/generic/Snackbar";
import { usePlaybackState } from "./usePlaybackState";
import { useCallback, useMemo } from "react";
import { processTree } from "components/render/processer/TreeFormatter";

type FileTypes = "map" | "trace";

export function useLoadFile() {
  const [specimen, setSpecimen] = useSpecimen();
  const notify = useSnackbar();
  const { stop } = usePlaybackState();

  const isMapLoaded = useMemo(() => !!specimen.map, [specimen.map]);
  const isTraceLoaded = useMemo(
    () => !!(specimen.interlang && specimen.eventList),
    [specimen.interlang, specimen.eventList]
  );

  const loadFile = useCallback((type: FileTypes, f: File) => {
    const reader = new FileReader();
    reader.readAsText(f, "UTF-8");
    switch (type) {
      case "map": {
        reader.onload = (e) => {
          try {
            setSpecimen({
              ...specimen,
              map: parseGridMap(e.target?.result as string),
            });
            notify(`Map load successfully`);
          } catch (e) {
            notify(`Map load fail`);
            throw e;
          }
        };
        break;
      }
      case "trace": {
        reader.onload = (e) => {
          stop();
          try {
            const trace = JSON.parse(e.target?.result as string);
            setSpecimen({
              ...specimen,
              interlang: parseViews(trace.render),
              eventList: trace.eventList,
            });
            notify(`Search Trace load successfully`);
          } catch (e) {
            notify(`Search Trace load fail`);
            throw e;
          }
        };
      }
    }
  }, []);

  const removeFile = useCallback((type: FileTypes) => {
    switch (type) {
      case "map": {
        setSpecimen({ ...specimen, map: undefined });
        break;
      }
      case "trace": {
        setSpecimen({
          ...specimen,
          interlang: undefined,
          eventList: undefined,
        });
        break;
      }
    }
  }, []);

  return [
    {
      isMapLoaded,
      isTraceLoaded,
    },
    loadFile,
    removeFile,
  ] as const;
}
