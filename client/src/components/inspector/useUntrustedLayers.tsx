import { ORIGIN_UNKNOWN } from "hooks/useWorkspace";
import { isTraceLayer } from "layers/trace/isTraceLayer";
import { find, map } from "lodash-es";
import { slice } from "slices";
import { useOne } from "slices/useOne";

export function useUntrustedLayers() {
  const { trustedOrigins } = useOne(slice.settings);
  const isTrusted = useOne(slice.ui.isTrusted);
  const layers = useOne(slice.layers, (s) =>
    map(s, (l) =>
      isTraceLayer(l)
        ? {
            key: l.key,
            origin: l.source?.origin,
          }
        : undefined,
    ),
  );
  if (!isTrusted) {
    const untrustedLayer = find(
      layers,
      (l) => !!l?.origin && !trustedOrigins?.includes?.(l?.origin),
    );
    if (untrustedLayer) {
      const { key, origin = ORIGIN_UNKNOWN } = untrustedLayer;
      return { isTrusted: false, key, origin };
    }
  }
  return { isTrusted: true };
}
