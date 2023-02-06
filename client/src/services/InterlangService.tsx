import { useSnackbar } from "components/generic/Snackbar";
import { useAsync } from "react-async-hook";
import { useInterlang } from "slices/interlang";
import { useLoadingState } from "slices/loading";
import { useSettings } from "slices/settings";
import { useSpecimen } from "slices/specimen";

export function InterlangService() {
  const usingLoadingState = useLoadingState("interlang");
  const notify = useSnackbar();
  const [specimen] = useSpecimen();
  const [interlang, setInterlang] = useInterlang();
  const [{convert=false}, setSettings] = useSettings();

  useAsync(
    (signal) => 
      usingLoadingState(async() => {
        if (specimen?.specimen?.nodeStructure && specimen?.specimen?.eventList) {
          const {nodeStructure, eventList} = specimen.specimen;

        } 
      }),
    [specimen]
  )
}