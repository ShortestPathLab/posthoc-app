import { Properties as Props } from "protocol";
import { Context, PropMap } from "./Context";
import { mapProperties } from "./mapProperties";
import { normalizeConstant } from "./normalize";

export function applyScope<T extends Props>(
  scope: PropMap<T>,
  props: PropMap<T>
): PropMap<T> {
  return Object.setPrototypeOf(
    mapProperties(
      props,
      (prop) => (provided: Context<T>) =>
        prop(applyScope(normalizeConstant(provided), scope))
    ),
    scope
  );
}
