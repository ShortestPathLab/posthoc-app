import type { TraceLayerData } from "layers/trace";
import { isTraceLayer } from "layers/trace/isTraceLayer";
import { ORIGIN_UNKNOWN } from "hooks/useWorkspace";
import { Layer, useLayers } from "slices/layers";
import { useSettings } from "slices/settings";
import { useUIState } from "slices/UIState";

export function useUntrustedLayers() {
  const [{ layers }] = useLayers();
  const [{ trustedOrigins }] = useSettings();
  const [{ isTrusted }] = useUIState();
  if (!isTrusted) {
    const untrustedLayer = layers?.find?.(
      (t) =>
        isTraceLayer(t) &&
        t.source?.origin &&
        !trustedOrigins?.includes?.(t.source?.origin)
    ) as Layer<TraceLayerData>;
    if (untrustedLayer) {
      const untrustedLayerOrigin =
        untrustedLayer?.source?.origin ?? ORIGIN_UNKNOWN;
      return { isTrusted: false, untrustedLayer, untrustedLayerOrigin };
    }
    return { isTrusted: true };
  }
  return { isTrusted: true };
}
