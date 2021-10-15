import { ceil } from "lodash";
import { useEffect, useMemo, useState } from "react";

const SPEED = 4;
const TARGET_FRAME_TIME = 1000 / 60;
export function useFrameTime(playing: boolean, step: number) {
  const [startTime, setStartTime] = useState(0);
  const [startFrame, setStartFrame] = useState(0);

  useEffect(() => {
    if (playing) {
      const now = Date.now();
      if (!startTime) {
        setStartTime(now);
        setStartFrame(step);
      }
    } else setStartTime(0);
  }, [setStartTime, startTime, setStartFrame, startFrame, playing, step]);

  return useMemo(
    () =>
      playing
        ? ceil(
            (Date.now() - startTime) / (TARGET_FRAME_TIME / SPEED) + startFrame
          )
        : 0,
    [startTime, startFrame, playing]
  );
}
