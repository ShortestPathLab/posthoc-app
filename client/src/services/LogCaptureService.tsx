import CaptureConsole from "capture-console-logs";
import { useSnackbar } from "components/generic/Snackbar";
import { join, truncate } from "lodash";
import { useEffect } from "react";

const captureOn = false;

export function LogCaptureService() {
  const notify = useSnackbar();
  useEffect(() => {
    if (captureOn && import.meta.env.DEV) {
      const cc = new CaptureConsole();
      cc.start(true);
      const interval = setInterval(() => {
        const captures = cc.getCaptures();
        if (captures.length) {
          for (const { args, function: f } of captures) {
            notify(`[${f}] ${truncate(join(args, ", "), { length: 200 })}`);
          }
          cc.flush();
        }
      }, 300);
      return () => {
        clearInterval(interval);
        cc.stop();
      };
    }
  }, []);
  return <></>;
}
