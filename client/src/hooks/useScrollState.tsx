import { useEffect, useRef, useState } from "react";

export function useScrollState(threshold: number = 128) {
  const [showControls, setShowControls] = useState(true);
  const [isAbsoluteTop, setIsAbsoluteTop] = useState(true);
  const [isTop, setIsTop] = useState(true);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const lastTop = useRef(0);
  useEffect(() => {
    if (target) {
      const listener = () => {
        {
          const newIsTop = target.scrollTop <= threshold;
          if (newIsTop !== isTop) {
            setIsTop(newIsTop);
          }
        }
        {
          const newIsTop = target.scrollTop <= 1;
          if (newIsTop !== isAbsoluteTop) {
            setIsAbsoluteTop(newIsTop);
          }
        }
        if (lastTop.current - target.scrollTop) {
          if (
            Math.abs(lastTop.current - target.scrollTop) > 2 &&
            lastTop.current >= 0
          ) {
            setShowControls(lastTop.current > target.scrollTop);
          }
          lastTop.current = target.scrollTop;
        }
      };
      target.addEventListener("scroll", listener, { passive: true });
      return () => {
        target.removeEventListener("scroll", listener);
      };
    }
  }, [target, isTop, isAbsoluteTop, lastTop, threshold]);
  return [
    showControls || isTop,
    isTop,
    isAbsoluteTop,
    target,
    setTarget,
  ] as const;
}