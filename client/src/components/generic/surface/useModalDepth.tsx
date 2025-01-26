import { useEffect, useState } from "react";
import { useUIState } from "slices/UIState";

export function useModalDepth(open: boolean) {
  const [{ depth: maxDepth }, setUIState] = useUIState();
  const [depth, setDepth] = useState(0);
  useEffect(() => {
    if (!open) return;
    let depth = 0;
    setUIState((prev) => {
      //TODO: Fix side effect
      depth = prev.depth!;
      return { depth: prev.depth! + 1 };
    });
    setDepth(depth + 1);
    return () => {
      setUIState((prev) => ({ depth: prev.depth! - 1 }));
    };
  }, [setUIState, setDepth, open]);

  return { depth, maxDepth };
}
