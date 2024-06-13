import { Layer } from "slices/layers";
import { set } from "utils/set";

export type TrustedLayerData = {
  origin?: string;
};

export function setLayerSource(
  layer: Layer<TrustedLayerData>,
  origin?: string
) {
  return set(layer, "source.origin", origin);
}
