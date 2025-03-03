import { useTheme } from "@mui/material";
import { isNull, max } from "lodash-es";
import { useEffect, useState } from "react";

const VELOCITY_THRESHOLD = 1;

export function useDrawerHandle(close?: () => void) {
  const theme = useTheme();
  const [paper, setPaper] = useState<HTMLDivElement | null>(null);
  const [scroll, setScroll] = useState<HTMLDivElement | null>(null);
  const [handle, setHandle] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!(handle && paper && scroll)) return;
    let initial: number | null = null;
    let now: number | null = null;
    let timeNow: number | null = null;
    let prev: number | null = null;
    let timePrev: number | null = null;
    let velocity = 0;
    const controller = new AbortController();
    const start = (y: number) => {
      // eslint-disable-next-line react-compiler/react-compiler
      paper.style.transition = theme.transitions.create(["max-height"], {
        easing: theme.transitions.easing.easeOut,
        duration: 500,
      });
      initial = y;
      now = y;
      timeNow = Date.now();
      prev = y;
      timePrev = Date.now();
    };

    const move = (y: number) => {
      if (isNull(initial)) return;
      prev = now;
      timePrev = timeNow;
      timeNow = Date.now();
      now = y;
      velocity = (now - (prev ?? now)) / (timeNow - (timePrev ?? timeNow));
      const dy = max([0, y - initial]);
      paper.style.transform = `translateY(${dy}px)`;
    };
    const end = (y?: number) => {
      if (isNull(initial)) return;
      paper.style.transition = theme.transitions.create(
        ["transform", "max-height"],
        {
          easing: theme.transitions.easing.easeOut,
          duration: 500,
        }
      );
      paper.style.transform = "none";
      const span = paper.getBoundingClientRect().height;
      // If the user has dragged more than half the paper height, close the drawer
      if (scroll.scrollTop === 0) {
        if (velocity < VELOCITY_THRESHOLD) {
          if ((y ?? now ?? 0) - initial > span / 2) close?.();
        } else if (velocity > 0) close?.();
      }
      initial = null;
      now = null;
    };
    [
      { target: handle, events: ["touchstart", "mousedown"], action: start },
      {
        target: scroll,
        events: ["touchstart"],
        action: (y: number) => {
          if (scroll.scrollTop === 0) {
            start(y);
          }
        },
      },
      {
        target: scroll,
        events: ["touchstart"],
        action: (y: number) => {
          if (scroll.scrollTop === 0) start(y);
        },
      },
      {
        target: scroll,
        events: ["scroll"],
        action: end,
      },
      { target: window, events: ["touchmove", "mousemove"], action: move },
      { target: window, events: ["touchend", "mouseup"], action: end },
    ].forEach(({ target, events, action }) =>
      events.forEach((event) =>
        target.addEventListener(
          event,
          (e) => {
            if (e instanceof TouchEvent) {
              action(e.touches[0]?.clientY);
            } else if (e instanceof MouseEvent) {
              action(e.clientY);
            } else {
              action(initial ?? 0);
            }
            e.stopPropagation();
          },
          { signal: controller.signal, passive: true }
        )
      )
    );
    return () => controller.abort();
  }, [handle, paper, theme, close]);
  return { setPaper, setHandle, setScroll };
}
