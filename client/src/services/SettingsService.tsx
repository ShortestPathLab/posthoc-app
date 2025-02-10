import { useEffect } from "react";
import { useSettings } from "slices/settings";
import { minimal } from "./SyncParticipant";
import { slice } from "slices";

export function SettingsService() {
  const [{ "behaviour/showOnStart": showOnStart }, , initialised] =
    useSettings();
  useEffect(() => {
    const workspace = new URLSearchParams(location.search).get("workspace");
    if (!minimal && showOnStart && initialised && !workspace) {
      slice.ui.fullscreenModal.set(showOnStart);
    }
  }, [initialised, minimal]);
  return <></>;
}
