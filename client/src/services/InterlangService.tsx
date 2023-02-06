import { Label } from "components/generic/Label";
import { useSnackbar } from "components/generic/Snackbar";
import { parseViews } from "components/render/parser/Parser";
import { useInterlang } from "slices/interlang";
import { useLoadingState } from "slices/loading";

import traceJson from "../data/grid-astar.trace.json";

export function InterlangService() {
  const usingLoadingState = useLoadingState("interlang");
  const notify = useSnackbar();
  const [, setInterlang] = useInterlang();

  usingLoadingState(async() => {
    const views = parseViews(traceJson.render);
    if (views !== undefined) {
      setInterlang(views);
    }
    notify((
      <Label
        primary="Intermediate Language generated."
        secondary={`${views?.main?.components?.length} components`} />
    ))
  });
}