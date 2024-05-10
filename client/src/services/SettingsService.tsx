import { useEffect } from "react";
import { useUIState } from "slices/UIState";
import { useSettings } from "slices/settings";
import { minimal } from "./SyncParticipant";

export function SettingsService() {
  const [{ "behaviour/showOnStart": showOnStart }, , initialised] =
    useSettings();
  const [, setUIState] = useUIState();
  useEffect(() => {
    if (!minimal && showOnStart && initialised) {
      setUIState(() => ({ fullscreenModal: showOnStart }));
    }
  }, [initialised, minimal]);
  return <></>;
}
