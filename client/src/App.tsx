import {
  CircularProgress,
  CssBaseline,
  Fade,
  Stack,
  ThemeProvider,
  useTheme,
} from "@mui/material";
import { Block } from "components/generic/Block";
import { SnackbarProvider } from "components/generic/Snackbar";
import { Inspector } from "components/inspector";
import { Placeholder } from "components/inspector/Placeholder";
import { TitleBar, TitleBarPlaceholder } from "components/title-bar/TitleBar";
import { Image } from "pages/Image";
import logo from "public/logo192.png";
import { useMemo } from "react";
import { services } from "services";
import { minimal } from "services/SyncParticipant";
import { useSyncStatus } from "services/SyncService";
import { useSettings } from "slices/settings";
import { SliceProvider as EnvironmentProvider } from "slices/SliceProvider";
import { makeTheme } from "theme";

function App() {
  const { palette } = useTheme();
  const color = palette.background.default;
  const { loading } = useSyncStatus();
  return (
    <Block
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
          <Block flex={1}>
            <Inspector flex={1} />
          </Block>
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
    </Block>
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
