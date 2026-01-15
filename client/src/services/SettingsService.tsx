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
  }, [minimal]);
  return <></>;
}
