import { useMediaQuery, useTheme } from "@mui/material";

export function useSmallDisplay() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("sm"));
}
