import { head } from "es-toolkit/compat";
import { useMemo } from "react";
import { slice } from "slices";
import { useOne } from "slices/useOne";

export function useRendererResolver(renderer?: string) {
  const renderers = useOne(slice.renderers);

  const autoRenderer = useMemo(() => head(renderers), [renderers]);

  return {
    auto: autoRenderer,
    selected:
      renderer && renderer !== "internal:auto" ? renderer : autoRenderer?.renderer?.meta?.id,
  };
}
