import { useMediaQuery, useTheme } from "@material-ui/core";

export function useSmallDisplay() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("sm"));
}
