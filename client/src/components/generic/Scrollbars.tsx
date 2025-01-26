import { useTheme } from "@mui/material";
import { OverlayScrollbars } from "overlayscrollbars";
import {
  OverlayScrollbarsComponent,
  OverlayScrollbarsComponentProps,
} from "overlayscrollbars-react";
import { ForwardedRef, ReactNode, useCallback } from "react";
import { useCss } from "react-use";

type Props = {
  children?: ReactNode;
  x?: boolean;
  y?: boolean;
  px?: number;
  py?: number;
};

export type ScrollProps = Props & OverlayScrollbarsComponentProps;

export function Scroll(
  { children, x, y, px = 6, py = 0, ...rest }: ScrollProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { palette, spacing } = useTheme();
  const cls = useCss({
    "--os-padding-perpendicular": "2px",
    "div.os-scrollbar-vertical > div.os-scrollbar-track": {
      height: `calc(100% - ${spacing(px)})`,
      marginTop: spacing(px),
    },
    "div.os-scrollbar-horizontal > div.os-scrollbar-track": {
      width: `calc(100% - ${spacing(py * 2)})`,
      marginLeft: spacing(py),
    },
    "div > div.os-scrollbar-track": {
      "--os-handle-perpendicular-size": "2px",
      "--os-handle-perpendicular-size-hover": "6px",
      "--os-handle-perpendicular-size-active": "6px",
      "> div.os-scrollbar-handle": {
        borderRadius: 0,
        opacity: 0.5,
        "&:hover": { opacity: 0.8 },
      },
    },
  });
  const handleRef = useCallback(
    (instance: OverlayScrollbars) => {
      if (ref && instance) {
        const viewport = instance.elements().viewport;
        if (viewport) {
          if (typeof ref === "function") {
            ref?.(viewport as HTMLDivElement);
          } else {
            ref.current = viewport as HTMLDivElement;
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
      style={{
        width: "100%",
        height: "100%",
        ...rest.style,
      }}
      className={`${cls} ${rest.className}`}
      events={{ initialized: handleRef }}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
}
