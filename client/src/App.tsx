import {
  CircularProgress,
  CssBaseline,
  Fade,
  Stack,
  ThemeProvider,
  useTheme,
} from "@mui/material";
import { Flex } from "components/generic/Flex";
import { SnackbarProvider } from "components/generic/Snackbar";
import { Inspector } from "components/inspector";
import { Placeholder } from "components/inspector/Placeholder";
import { TitleBar, TitleBarPlaceholder } from "components/title-bar/TitleBar";
import { useTitleBar } from "hooks/useTitleBar";
import { useWorkspace } from "hooks/useWorkspace";
import { setLayerSource } from "layers/TrustedLayerData";
import { Image } from "pages/Image";
import logo from "public/logo192.png";
import { useEffect, useMemo } from "react";
import { BootstrapService } from "services/BootstrapService";
import { ConnectionsService } from "services/ConnectionsService";
import { FeaturesService } from "services/FeaturesService";
import { LayerService } from "services/LayerService";
import { LogCaptureService } from "services/LogCaptureService";
import { RendererService } from "services/RendererService";
import { CloudStorageService } from "services/CloudStorageService";
import { SettingsService } from "services/SettingsService";
import { minimal } from "services/SyncParticipant";
import { SyncService, useSyncStatus } from "services/SyncService";
import { SliceProvider as EnvironmentProvider } from "slices/SliceProvider";
import { useUIState } from "slices/UIState";
import { useLayers } from "slices/layers";
import { useSettings } from "slices/settings";
import { makeTheme } from "theme";
import { parseYamlAsync } from "workers/async";
import { FetchDriveFileService } from "services/FetchDriveFileService";

const services = [
  SyncService,
  ConnectionsService,
  FeaturesService,
  RendererService,
  LayerService,
  LogCaptureService,
  SettingsService,
  CloudStorageService,
  FetchDriveFileService,
  BootstrapService,
];

function App() {
  const { palette } = useTheme();
  const color = palette.background.default;
  const { loading } = useSyncStatus();
  const [UIStateStore, setUIState] = useUIState();

  const [layersStore, setLayers] = useLayers();
  return (
    <Flex
      vertical
      sx={{
        bgcolor: color,
        color: "text.primary",
        WebkitAppRegion: "no-drag",
      }}
    >
      {!loading ? (
        <>
          <TitleBar />
          <Flex flex={1}>
            <Inspector flex={1} />
          </Flex>
        </>
      ) : minimal ? (
        <Fade in>
          <Stack
            sx={{
              WebkitAppRegion: "drag",
              background: (t) => t.palette.background.paper,
              width: "100vw",
              height: "100dvh",
            }}
          >
            <TitleBarPlaceholder />
            <Placeholder icon={<CircularProgress />} />
          </Stack>
        </Fade>
      ) : (
        <Fade in>
          <Stack
            sx={{
              WebkitAppRegion: "drag",
              width: "100vw",
              height: "100dvh",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Image src={logo} style={{ height: 64, width: 64 }} />
            <CircularProgress />
          </Stack>
        </Fade>
      )}
    </Flex>
  );
}

function ThemedApp() {
  const [
    {
      "appearance/theme": mode = "dark",
      "appearance/accentColor": accent = "teal",
    },
  ] = useSettings();
  const theme = useMemo(() => makeTheme(mode, accent), [mode, accent]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <SnackbarProvider>
          <EnvironmentProvider services={services}>
            <App />
          </EnvironmentProvider>
        </SnackbarProvider>
      </CssBaseline>
    </ThemeProvider>
  );
}

export default ThemedApp;
