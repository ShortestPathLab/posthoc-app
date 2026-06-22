import { useEffect } from "react";
import { minimal } from "./SyncParticipant";
import { slice } from "slices";
import { useOne } from "slices/useOne";

export function SettingsService() {
  const { "behaviour/showOnStart": showOnStart } = useOne(slice.settings);
  useEffect(() => {
    const workspace = new URLSearchParams(location.search).get("workspace");
    if (!minimal && showOnStart && !workspace) {
      slice.ui.fullscreenModal.set(showOnStart);
    }
    // Show the start modal once on mount only; later toggles of the setting
    // should not reopen it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <></>;
}
