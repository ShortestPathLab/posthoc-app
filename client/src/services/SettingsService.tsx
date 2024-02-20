import { useEffect } from "react";
import { useUIState } from "slices/UIState";
import { useSettings } from "slices/settings";

export function SettingsService() {
  const [{ "behaviour/showExplorePageOnStart": showExplore }, , initialised] =
    useSettings();
  const [, setUIState] = useUIState();
  useEffect(() => {
    if (showExplore && initialised) {
      setUIState(() => ({ fullscreenModal: "explore" }));
    }
  }, [initialised]);
  return <></>;
}
