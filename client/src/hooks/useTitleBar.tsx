import interpolate from "color-interpolate";
import { times } from "lodash";
import memo from "memoizee";
import { name } from "public/manifest.json";
import { useEffect, useState } from "react";
import { slice } from "slices";
import { getForegroundColor } from "./getForegroundColor";

interface Electron {
  invoke(name: "title-bar", bg: string, fg: string): void;
}

declare global {
  interface Window {
    electron?: Electron;
  }
}

const stackColors = memo(
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

    const {
      data: [r, g, b],
    } = ctx.getImageData(0, 0, 1, 1);

    return `rgb(${r},${g},${b})`; // 139,124,37
  },
  { normalizer: JSON.stringify }
);

export function useTitleBar(color: string) {
  "use no memo";
  const depth = slice.ui.depth.use();
  const [current, setCurrent] = useState(color);
  const target = stackColors(color, "rgba(0,0,0,0.5)", depth);
  useEffect(() => {
    if (current !== target) {
      const mixed = interpolate([current, target])(0.5);
      requestAnimationFrame(() => {
        document
          .querySelector('meta[name="theme-color"]')!
          .setAttribute("content", mixed);
        document.title = name;
        if (window.electron) {
          window.electron.invoke(
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
