import CaptureConsole from "capture-console-logs";
import { useSnackbar } from "components/generic/Snackbar";
import { head, truncate } from "lodash";
import { useEffect } from "react";

export function LogCaptureService() {
  const notify = useSnackbar();
  useEffect(() => {
    const cc = new CaptureConsole();
    cc.start(true);
    const interval = setInterval(() => {
      const captures = cc.getCaptures();
      if (captures.length) {
        for (const { args } of captures) {
          notify(`${truncate(head(args), { length: 200 })}`);
        }
        cc.flush();
      }
    }, 300);
    return () => {
      clearInterval(interval);
      cc.stop();
    };
  }, []);
  return <></>;
}
