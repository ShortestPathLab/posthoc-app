import { useEffect } from "react";
import { name } from "manifest.json";

export function useTitleBar(color: string) {
  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')!
      .setAttribute("content", color);
    document.title = name;
  }, [color]);
}
