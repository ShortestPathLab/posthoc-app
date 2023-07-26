import { useTheme, ThemeProvider } from "@mui/material";
import { Flex } from "components/generic/Flex";
import { SnackbarProvider } from "components/generic/Snackbar";
import { Inspector } from "components/inspector";
import { useTitleBarColor } from "hooks/useTitleBarColor";
import { useMemo } from "react";
import { useSettings } from "slices/settings";
import { makeTheme } from "theme";

function App() {
  const theme = useTheme();
  const color = theme.palette.background.default;
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
  const [{ theme: mode = "light", accentColor: accent = "teal" }] =
    useSettings();
  const theme = useMemo(() => makeTheme(mode, accent), [mode, accent]);
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default ThemedApp;
