import { getContrastRatio } from "@mui/material";

export const getForegroundColor = (bg: string) =>
  getContrastRatio(bg, "#ffffff") > getContrastRatio(bg, "#000000")
    ? "#ffffff"
    : "#000000";
