import { ThemeProvider, useTheme } from "@mui/material";
import { Flex } from "components/generic/Flex";
import { SnackbarProvider } from "components/generic/Snackbar";
import { Inspector } from "components/inspector";
import { useTitleBarColor } from "hooks/useTitleBarColor";
import { useMemo } from "react";
import { ConnectionsService } from "services/ConnectionsService";
import { FeaturesService } from "services/FeaturesService";
import { LayerService } from "services/LayerService";
import { RendererService } from "services/RendererService";
import { SliceProvider as EnvironmentProvider } from "slices/SliceProvider";
import { useSettings } from "slices/settings";
import { makeTheme } from "theme";

const services = [
  ConnectionsService,
  FeaturesService,
  RendererService,
  LayerService,
];

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
        <EnvironmentProvider services={services}>
          <App />
        </EnvironmentProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default ThemedApp;
