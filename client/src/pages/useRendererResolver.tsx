import { head } from "lodash";
import { useMemo } from "react";
import { useRenderers } from "slices/renderers";

export function useRendererResolver(renderer?: string) {
  const [renderers] = useRenderers();

  const autoRenderer = useMemo(() => head(renderers), [renderers]);

  return {
    auto: autoRenderer,
    selected:
      renderer && renderer !== "internal:auto"
        ? renderer
        : autoRenderer?.renderer?.meta?.id,
  };
}
