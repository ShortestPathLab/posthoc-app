import { useContext } from "react";
import { SurfaceSizeContext } from "./DrawerSurface";
import { drawerTitleHeight } from "./DrawerTitle";
import { isNumber } from "lodash";

export function useSurfaceSize() {
  return useContext(SurfaceSizeContext);
}
/**
 * Gets the maximum available size of the drawer that wouldn't result in scrolling,
 * subtracting the height of the drawer title.
 */
export function useSurfaceAvailableCssSize() {
  const size = useSurfaceSize();
  return size
    ? {
        width: size.width,
        height: `calc(${
          isNumber(size.height) ? `${size.height}px` : size.height
        } - ${drawerTitleHeight}px)`,
      }
    : { width: "100%", height: "100%" };
}
