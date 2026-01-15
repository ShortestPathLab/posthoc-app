import { useEffect, useState } from "react";
import { slice } from "slices";
import { useOne } from "slices/useOne";

export function useModalDepth(open: boolean) {
  const maxDepth = useOne(slice.ui.depth);
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
