import { Label } from "components/generic/Label";
import { useSnackbar } from "components/generic/Snackbar";
import { parseViews } from "components/render/parser/Parser";
import { useAsyncAbortable as useAsync } from "react-async-hook";
import { useInterlang } from "slices/interlang";
import { useLoadingState } from "slices/loading";

import traceJson from "../data/grid-astar.trace.json";

export function InterlangService() {
  const usingLoadingState = useLoadingState("interlang");
  const notify = useSnackbar();
  const [, setInterlang] = useInterlang();
  
  useAsync(
    (signal) => 
      usingLoadingState(async() => {
        const views = parseViews(traceJson.render);
        if (views !== undefined && !signal.aborted) {
          setInterlang(views);
        }
        notify((
          <Label
            primary="Interlang generated."
            secondary={`${views?.main?.components?.length} components`} />
        ))
      }),
    [traceJson, setInterlang]
  )
  return <></>
}