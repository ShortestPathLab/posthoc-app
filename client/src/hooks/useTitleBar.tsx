import { getContrastRatio } from "@mui/material";
import { defer } from "lodash";
import { name } from "public/manifest.json";
import { useEffect } from "react";

const getForegroundColor = (bg: string) =>
  getContrastRatio(bg, "#ffffff") > getContrastRatio(bg, "#000000")
    ? "#ffffff"
    : "#000000";

export function useTitleBar(color: string) {
  useEffect(() => {
    defer(() =>
      document
        .querySelector('meta[name="theme-color"]')!
        .setAttribute("content", color)
    );
    document.title = name;
    if ("electron" in window) {
      (window.electron as any).invoke(
        "title-bar",
        "#00000000",
        getForegroundColor(color)
      );
    }
  }, [color]);
}
