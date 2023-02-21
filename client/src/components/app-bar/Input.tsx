import { ButtonWithTooltip as Button } from "components/generic/ButtonWithTooltip";
import { fileDialog as file } from "file-select-dialog";
import { Space } from "components/generic/Space";
import { MapRounded as MapIcon, TravelExploreRounded as TraceIcon } from "@material-ui/icons";
import { useCallback } from "react";
import { useLoadFile } from "hooks/useLoadFile";

export function Input() {
  const [{isMapLoaded, isTraceLoaded}, loadFile, removeFile] = useLoadFile();
  
  const handleMapInput = useCallback(async () => {
    const f = await file({
      strict: true,
    });
    loadFile("map", f);
  }, [stop]);

  const handleTraceInput = useCallback(async () => {
    const f = await file({
      strict: true,
    });
    loadFile("trace", f);
  }, [stop]);

  return (
    <>
      {
        isTraceLoaded?
          <Button
            label="trace"
            variant="contained"
            startIcon={<TraceIcon />}
            onClick={() => removeFile("trace")}
          >
            TRACE
          </Button>
        : <Button
            label="remove trace"
            startIcon={<TraceIcon />}
            onClick={handleTraceInput}
          >
            TRACE
          </Button>
      }
      <Space />
      {
        isMapLoaded?
          <Button
            label="domain"
            variant="contained"
            startIcon={<MapIcon />}
            onClick={() => removeFile("map")}
          >
            DOMAIN
          </Button>
        :<Button
            label="domain"
            startIcon={<MapIcon />}
            onClick={handleMapInput}
          >
            DOMAIN
          </Button>
      }
    </>
  )
}