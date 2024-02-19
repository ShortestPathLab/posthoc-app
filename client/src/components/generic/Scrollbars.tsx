import { useTheme } from "@mui/material";
import {
  OverlayScrollbarsComponent,
  OverlayScrollbarsComponentProps,
} from "overlayscrollbars-react";
import { OverlayScrollbars } from "overlayscrollbars";
import { useCss } from "react-use";
import { ForwardedRef, forwardRef, ReactNode, useCallback } from "react";

type ScrollProps = {
  children?: ReactNode;
  x?: boolean;
  y?: boolean;
  px?: number;
  py?: number;
};

export const Scroll = forwardRef(
  (
    {
      children,
      x,
      y,
      px = 6,
      py = 0,
      ...rest
    }: ScrollProps & OverlayScrollbarsComponentProps,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const { palette, spacing } = useTheme();
    const cls = useCss({
      "div.os-scrollbar-vertical > div.os-scrollbar-track": {
        height: `calc(100% - ${spacing(px)})`,
        marginTop: spacing(px),
      },
      "div.os-scrollbar-horizontal > div.os-scrollbar-track": {
        width: `calc(100% - ${spacing(py * 2)})`,
        marginLeft: spacing(py),
      },
    });
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
            autoHide: "leave",
            theme: palette.mode === "dark" ? "os-theme-light" : "os-theme-dark",
          },
        }}
        {...rest}
        className={`${cls} ${rest.className}`}
        events={{ initialized: handleRef }}
      >
        {children}
      </OverlayScrollbarsComponent>
    );
  }
);
