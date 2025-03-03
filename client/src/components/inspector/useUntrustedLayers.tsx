import { ORIGIN_UNKNOWN } from "hooks/useWorkspace";
import { isTraceLayer } from "layers/trace/isTraceLayer";
import { find, map } from "lodash-es";
import { slice } from "slices";
import { useSettings } from "slices/settings";

export function useUntrustedLayers() {
  "use no memo";
  const [{ trustedOrigins }] = useSettings();
  const isTrusted = slice.ui.isTrusted.use();
  const layers = slice.layers.use((s) =>
    map(s, (l) =>
      isTraceLayer(l)
        ? {
            key: l.key,
            origin: l.source?.origin,
          }
        : undefined
    )
  );
  if (!isTrusted) {
    const untrustedLayer = find(
      layers,
      (l) => !!l?.origin && !trustedOrigins?.includes?.(l?.origin)
    );
    if (untrustedLayer) {
      const { key, origin = ORIGIN_UNKNOWN } = untrustedLayer;
      return { isTrusted: false, key, origin };
    }
  }
  return { isTrusted: true };
}
