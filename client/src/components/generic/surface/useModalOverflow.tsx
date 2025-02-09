import { ResizeSensor } from "css-element-queries";
import { useSm } from "hooks/useSmallDisplay";
import { useEffect, useState } from "react";

export function useModalOverflow(height?: string | number) {
  const sm = useSm();

  const [modal, setModal] = useState<HTMLElement | null>(null);
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [overflow, setOverflow] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (!(modal && content && !sm && !height)) return;
    const f = () => {
      // 64 is the total amount of y padding in the modal
      setOverflow(window.innerHeight - 64 < content.offsetHeight);
      setContentHeight(
        content.offsetHeight <= 1 ? 0 : Math.ceil(content.offsetHeight)
      );
    };
    window.addEventListener("resize", f);
    const o = new ResizeSensor(content, f);
    f();
    return () => {
      window.removeEventListener("resize", f);
      o.detach();
    };
  }, [modal, content, sm, height]);
  return {
    setModal,
    setContent,
    overflow,
    contentHeight,
  };
}
