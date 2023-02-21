import { ButtonWithTooltip as Button } from "components/generic/ButtonWithTooltip";
import { fileDialog as file } from "file-select-dialog";
import { useSpecimen } from "slices/specimen";
import { Space } from "components/generic/Space";
import { MapRounded as MapIcon, TravelExploreRounded as TraceIcon } from "@material-ui/icons";
import { useCallback } from "react";
import { parseGridMap } from "components/render/renderer/generic/MapParser";
import { parseViews } from "components/render/parser/Parser";
import { useSnackbar } from "components/generic/Snackbar";

export function Input() {
  const [specimen,setSpecimen] = useSpecimen();
  const notify = useSnackbar();
  
  const handleMapInput = useCallback(async () => {
    const reader = new FileReader();
    const f = await file({
      strict: true,
    });
    reader.readAsText(f, "UTF-8");
    reader.onload = e => {
      try {
        setSpecimen({
          ...specimen,
          map: parseGridMap(e.target?.result as string)
        });
        notify(
          `Map load successfully`
        );
      } catch(e) {
        notify(
          `Map load fail`
        );
        throw e;
      }
    }
  }, []);

  const handleTraceInput = useCallback(async () => {
    const reader = new FileReader();
    const f = await file({
      strict: true,
    });
    reader.readAsText(f, "UTF-8");
    reader.onload = e => {
      try {
        const trace = JSON.parse(e.target?.result as string);
        setSpecimen({
          ...specimen,
          interlang: parseViews(trace.render),
          eventList: trace.eventList,
        });
        notify(
          `Search Trace load successfully`
        );
      } catch(e) {
        notify(
          `Search Trace load fail`
        );
        throw e;
      }
    }
  }, []);

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