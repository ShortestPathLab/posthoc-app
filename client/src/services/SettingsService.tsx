import { useEffect } from "react";
import { minimal } from "./SyncParticipant";
import { slice } from "slices";

export function SettingsService() {
  "use no memo";
  const { "behaviour/showOnStart": showOnStart } = slice.settings.use();
  useEffect(() => {
    const workspace = new URLSearchParams(location.search).get("workspace");
    if (!minimal && showOnStart && !workspace) {
      slice.ui.fullscreenModal.set(showOnStart);
    }
  }, [minimal]);
  return <></>;
}
