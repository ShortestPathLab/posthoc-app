import { Properties as Props } from "protocol";
import { Context, PropMap } from "./Context";
import { mapProperties } from "./mapProperties";
import { normalize } from "./normalize";

export function applyScope<T extends Props>(
  scope: PropMap<T>,
  props: PropMap<T>
): PropMap<T> {
  const scopedComponent = mapProperties(
    props,
    (prop) => (provided: Context<T>) =>
      prop(applyScope(normalize(provided), scope))
  );
  return { ...scope, ...scopedComponent };
}