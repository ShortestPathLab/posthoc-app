import { useEffect } from "react";
import { useUIState } from "slices/UIState";
import { useSettings } from "slices/settings";
import { minimal } from "./SyncParticipant";

export function SettingsService() {
  const [{ "behaviour/showOnStart": showOnStart }, , initialised] =
    useSettings();
  const [, setUIState] = useUIState();
  useEffect(() => {
    const workspace = new URLSearchParams(location.search).get("workspace");
    if (!minimal && showOnStart && initialised && !workspace) {
      setUIState(() => ({ fullscreenModal: showOnStart }));
    }
  }, [initialised, minimal]);
  return <></>;
}
