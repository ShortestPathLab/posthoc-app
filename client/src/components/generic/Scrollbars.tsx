import { useTheme } from "@mui/material";
import { OverlayScrollbars } from "overlayscrollbars";
import {
  OverlayScrollbarsComponent,
  OverlayScrollbarsComponentProps,
  OverlayScrollbarsComponentRef,
} from "overlayscrollbars-react";
import React, {
  ForwardedRef,
  MutableRefObject,
  ReactNode,
  Ref,
  RefCallback,
  forwardRef,
  useCallback,
} from "react";

type ScrollProps = {
  children?: ReactNode;
  x?: boolean;
  y?: boolean;
};

export const Scroll = forwardRef(
  (
    { children, x, y, ...rest }: ScrollProps & OverlayScrollbarsComponentProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const theme = useTheme();
    const handleRef = useCallback(
      (instance: OverlayScrollbars) => {
        if (ref) {
          if (instance) {
            const viewport = instance.elements().viewport;
            if (viewport) {
              if (typeof ref === "function") {
                ref(viewport as HTMLDivElement);
              } else {
                ref.current = viewport as HTMLDivElement;
              }
            }
          }
        }
      },
      [ref]
    );
    return (
      <OverlayScrollbarsComponent
        options={{
          overflow: { x: x ? "scroll" : "hidden", y: y ? "scroll" : "hidden" },
          scrollbars: {
            autoHide: "move",
            theme:
              theme.palette.mode === "dark"
                ? "os-theme-light"
                : "os-theme-dark",
          },
        }}
        {...rest}
        events={{ initialized: handleRef }}
      >
        {children}
      </OverlayScrollbarsComponent>
    );
  }
);
