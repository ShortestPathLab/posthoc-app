import { ThemeProvider, useTheme } from "@mui/material";
import { Flex } from "components/generic/Flex";
import { SnackbarProvider } from "components/generic/Snackbar";
import { Inspector } from "components/inspector";
import { TitleBar } from "components/title-bar/TitleBar";
import { useTitleBar } from "hooks/useTitleBar";
import { useMemo } from "react";
import { ConnectionsService } from "services/ConnectionsService";
import { FeaturesService } from "services/FeaturesService";
import { LayerService } from "services/LayerService";
import { LogCaptureService } from "services/LogCaptureService";
import { RendererService } from "services/RendererService";
import { SettingsService } from "services/SettingsService";
import { SliceProvider as EnvironmentProvider } from "slices/SliceProvider";
import { useSettings } from "slices/settings";
import { makeTheme } from "theme";

const services = [
  ConnectionsService,
  FeaturesService,
  RendererService,
  LayerService,
  LogCaptureService,
  SettingsService,
];

function App() {
  const { palette } = useTheme();
  const color = palette.background.default;
  useTitleBar(color);

  return (
    <Flex
      vertical
      sx={{
        bgcolor: color,
        color: "text.primary",
      }}
    >
      <TitleBar />
      <Flex flex={1}>
        <Inspector flex={1} />
      </Flex>
    </Flex>
  );
}

function ThemedApp() {
  const [
    {
      "appearance/theme": mode = "light",
      "appearance/accentColor": accent = "teal",
    },
  ] = useSettings();
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
