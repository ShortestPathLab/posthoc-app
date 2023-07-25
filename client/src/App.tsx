import { useTheme, ThemeProvider } from "@mui/material";
import { Flex } from "components/generic/Flex";
import { Inspector } from "components/inspector";
import { useTitleBarColor } from "hooks/useTitleBarColor";
import { useMemo } from "react";
import { useSettings } from "slices/settings";
import { makeTheme } from "theme";

function App() {
  const theme = useTheme();
  const color = theme.palette.mode === "dark" ? "#020203" : "#edf0ef";
  useTitleBarColor(color);
  return (
    <Flex
      vertical
      sx={{
        bgcolor: color,
        p: 0.5,
        color: "text.primary",
      }}
    >
      <Inspector flex={1} />
    </Flex>
  );
}

function ThemedApp() {
  const [{ theme: mode = "light" }] = useSettings();
  const theme = useMemo(() => makeTheme(mode), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );
}

export default ThemedApp;
