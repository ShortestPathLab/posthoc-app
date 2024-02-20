import { ThemeProvider, useTheme } from "@mui/material";
import { useMemo } from "react";
import { Flex } from "components/generic/Flex";
import { SnackbarProvider } from "components/generic/Snackbar";
import { Inspector } from "components/inspector";
import { useTitleBar } from "hooks/useTitleBar";
import { ConnectionsService } from "services/ConnectionsService";
import { FeaturesService } from "services/FeaturesService";
import { LayerService } from "services/LayerService";
import { RendererService } from "services/RendererService";
import { useSettings } from "slices/settings";
import { SliceProvider as EnvironmentProvider } from "slices/SliceProvider";
import { makeTheme } from "theme";
import { TitleBar } from "components/title-bar/TitleBar";
import { LogCaptureService } from "services/LogCaptureService";
import { SettingsService } from "services/SettingsService";

const services = [
  ConnectionsService,
  FeaturesService,
  RendererService,
  LayerService,
  LogCaptureService,
  SettingsService,
];

function App() {
  const theme = useTheme();
  const color = theme.palette.background.default;
  useTitleBar(color);

  return (
    <Flex
      vertical
      sx={{
        bgcolor: color,
        // p: 0.5,
        color: "text.primary",
      }}
    >
      <TitleBar />
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
