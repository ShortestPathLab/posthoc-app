import { useEffect, useState } from "react";
import { slice } from "slices";

export function useModalDepth(open: boolean) {
  "use no memo";
  const maxDepth = slice.ui.depth.use();
  const [depth, setDepth] = useState(0);
  useEffect(() => {
    if (!open) return;
    slice.ui.depth.set((d = 0) => d + 1);
    setDepth(slice.ui.depth.get() ?? 0);
    return () => {
      slice.ui.depth.set((d = 0) => d - 1);
    };
  }, [setDepth, open]);

  return { depth, maxDepth };
}
