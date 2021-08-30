import PlaybackService from "old/services/playback";
import { useEffect, useState } from "react";

export type PlaybackState = "ready" | "running" | "paused" | "none";

function createCancellableListener(listener: () => void) {
  let cancelled = false;
  return [
    () => {
      if (!cancelled) return listener();
    },
    () => {
      cancelled = true;
    },
  ];
}

export function usePlaybackState() {
  const [state, setState] = useState<PlaybackState>("none");
  useEffect(() => {
    const [listener, off] = createCancellableListener(() =>
      setState(PlaybackService.state)
    );
    PlaybackService.observe("onAfterTransition", listener);
    return off;
  }, []);
  return state;
}
