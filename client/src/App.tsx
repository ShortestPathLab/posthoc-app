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
import { isMobile } from "mobile-device-detect";
import { useMemo } from "react";
import { services } from "services";
import { minimal } from "services/SyncParticipant";
import { useSyncStatus } from "services/SyncService";
import { SidebarPlaceholder } from "Sidebar";
import { slice } from "slices";
import { SliceProvider as EnvironmentProvider } from "slices/SliceProvider";
import { useOne } from "slices/useOne";
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
        "> *": {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
      }}
    >
      {!loading && (
        <Stack>
          <TitleBar />
          <Block flex={1}>
            <Inspector flex={1} />
          </Block>
        </Stack>
      )}
      <Fade in={loading} unmountOnExit>
        <Stack
          sx={{
            WebkitAppRegion: "drag",
            background: (t) => t.palette.background.paper,
            width: "100vw",
            height: "100dvh",
          }}
        >
          {minimal || isMobile ? (
            <>
              <TitleBarPlaceholder />
              <Placeholder icon={<CircularProgress />} />
            </>
          ) : (
            <>
              <TitleBarPlaceholder />
              <Stack direction="row" sx={{ flex: 1 }}>
                <SidebarPlaceholder />
                <Placeholder icon={<></>} />
              </Stack>
            </>
          )}
        </Stack>
      </Fade>
    </Block>
  );
}

function ThemedApp() {
  const {
    "appearance/theme": mode = "dark",
    "appearance/accentColor": accent = "teal",
  } = useOne(slice.settings);
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
