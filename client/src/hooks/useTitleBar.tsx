import { getContrastRatio, useTheme } from "@mui/material";
import interpolate from "color-interpolate";
import { times } from "lodash";
import memoizee from "memoizee";
import { name } from "public/manifest.json";
import { useEffect, useState } from "react";
import { useUIState } from "slices/UIState";

const stackColors = memoizee(
  (base, layer, count = 0) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = 1;
    canvas.height = 1;
    const colors = [base, ...times(count, () => layer)];
    for (const color of colors) {
      // default background
      ctx.beginPath();
      ctx.rect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fill();
    }

    const d = ctx.getImageData(0, 0, 1, 1).data;

    return `rgb(${d[0]},${d[1]},${d[2]})`; // 139,124,37
  },
  { normalizer: JSON.stringify }
);

const getForegroundColor = (bg: string) =>
  getContrastRatio(bg, "#ffffff") > getContrastRatio(bg, "#000000")
    ? "#ffffff"
    : "#000000";

export function useTitleBar(color: string) {
  const { palette } = useTheme();
  const [{ depth }] = useUIState();
  const [target, setTarget] = useState(color);
  const [current, setCurrent] = useState(color);
  useEffect(() => {
    const mixedColor = stackColors(color, "rgba(0,0,0,0.5)", depth);
    setTarget(mixedColor);
  }, [color, depth, palette]);
  useEffect(() => {
    if (current !== target) {
      const mixed = interpolate([current, target])(0.5);
      requestAnimationFrame(() => {
        document
          .querySelector('meta[name="theme-color"]')!
          .setAttribute("content", mixed);
        document.title = name;
        if ("electron" in window) {
          (window.electron as any).invoke(
            "title-bar",
            "#00000000",
            getForegroundColor(mixed)
          );
        }
        setCurrent(mixed);
      });
    }
  }, [current, target, setCurrent]);
}
