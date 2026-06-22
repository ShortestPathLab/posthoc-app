import { ORIGIN_UNKNOWN } from "hooks/useWorkspace";
import { isTraceLayer } from "layers/trace/isTraceLayer";
import { find, map } from "es-toolkit/compat";
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
      // Default moved out of destructure to avoid React Compiler bailout.
      const { key, origin: originProp } = untrustedLayer;
      const origin = originProp ?? ORIGIN_UNKNOWN;
      return { isTrusted: false, key, origin };
    }
  }
  return { isTrusted: true };
}
