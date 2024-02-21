import { useEffect } from "react";
import { useUIState } from "slices/UIState";
import { useSettings } from "slices/settings";

export function SettingsService() {
  const [{ "behaviour/showOnStart": showOnStart }, , initialised] =
    useSettings();
  const [, setUIState] = useUIState();
  useEffect(() => {
    if (showOnStart && initialised) {
      setUIState(() => ({ fullscreenModal: showOnStart }));
    }
  }, [initialised]);
  return <></>;
}
