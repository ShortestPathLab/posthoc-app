import { Properties as Props } from "protocol";
import { PropMap } from "./Context";
import { mapProperties } from "./mapProperties";

export function applyScope<T extends Props>(
  scope: PropMap<T>,
  props: PropMap<T>
): PropMap<T> {
  return Object.setPrototypeOf(
    mapProperties(props, (prop) => () => prop(scope)),
    scope
  );
}
