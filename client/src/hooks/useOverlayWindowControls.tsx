import { useEffect, useState } from "react";

export function useOverlayWindowControls() {
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect>(new DOMRect());
  useEffect(() => {
    if ("windowControlsOverlay" in navigator) {
      const f = () => {
        setVisible(!!navigator.windowControlsOverlay.visible);
        setRect(navigator.windowControlsOverlay.getTitlebarAreaRect());
      };
      navigator.windowControlsOverlay.addEventListener("geometrychange", f);
      f();
      return () =>
        navigator.windowControlsOverlay.removeEventListener(
          "geometrychange",
          f
        );
    }
  }, [setVisible]);
  return { visible, rect };
}
