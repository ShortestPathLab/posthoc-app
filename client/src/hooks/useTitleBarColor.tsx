import { useEffect } from "react";

export function useTitleBarColor(color: string) {
  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')!
      .setAttribute("content", color);
  }, [color]);
}