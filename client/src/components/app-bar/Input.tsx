import { ButtonWithTooltip as Button } from "components/generic/ButtonWithTooltip";
import { fileDialog as file } from "file-select-dialog";
import { Space } from "components/generic/Space";
import { MapRounded as MapIcon, TravelExploreRounded as TraceIcon } from "@material-ui/icons";
import { useCallback } from "react";
import { usePlaybackState } from "hooks/usePlaybackState";
import { loadMapFile, loadTraceFile } from "./load";
import { useSpecimen } from "slices/specimen";
import { useSnackbar } from "components/generic/Snackbar";

export function Input() {
  const [specimen,setSpecimen] = useSpecimen();
  const notify = useSnackbar();
  const {
    stop,
  } = usePlaybackState();
  
  const handleMapInput = useCallback(async () => {
    const f = await file({
      strict: true,
    });
    loadMapFile(f, specimen, setSpecimen, notify);
  }, [stop]);

  const handleTraceInput = useCallback(async () => {
    const f = await file({
      strict: true,
    });
    loadTraceFile(f, specimen, setSpecimen, notify);
  }, [stop]);

  return (
    <>
      <Button
        label="trace"
        startIcon={<TraceIcon />}
        onClick={handleTraceInput}
      >
        TRACE
      </Button>
      <Space />
      <Button
        label="domain"
        startIcon={<MapIcon />}
        onClick={handleMapInput}
      >
        DOMAIN
      </Button>
    </>
  )
}