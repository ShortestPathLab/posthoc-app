import { useTheme } from "@mui/material";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import React, { ReactNode } from "react";

type ScrollProps = {
  children?: ReactNode;
  x?: boolean;
  y?: boolean;
};

export function Scroll({ children, x, y }: ScrollProps) {
  const theme = useTheme();
  return (
    <OverlayScrollbarsComponent
      options={{
        overflow: { x: x ? "scroll" : "hidden", y: y ? "scroll" : "hidden" },
        scrollbars: {
          autoHide: "move",
          theme:
            theme.palette.mode === "dark" ? "os-theme-light" : "os-theme-dark",
        },
      }}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
}
