import { useSnackbar } from "components/generic/Snackbar";
import { useEffect } from "react";
import { useInfo } from "slices/info";

export function ConnectionStateService() {
  const notify = useSnackbar();
  const [info] = useInfo();

  useEffect(
    () =>
      notify(
        info
          ? `Connected: ${info.name} ${info.version}`
          : "Connecting to the solver..."
      ),
    [notify, info]
  );

  return <></>;
}
