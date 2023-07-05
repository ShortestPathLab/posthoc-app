import { CssBaseline, ThemeProvider } from "@mui/material";
import App from "App";
import { SnackbarProvider } from "components/generic/Snackbar";
import "index.css";
import { render } from "react-dom";
import { ConnectionsService } from "services/ConnectionsService";
import { FeaturesService } from "services/FeaturesService";
import { PlaybackService } from "services/PlaybackService";
import { RendererService } from "services/RendererService";
import { SpecimenService } from "services/SpecimenService";
import { SliceProvider as EnvironmentProvider } from "slices/SliceProvider";
import { UIStateProvider } from "slices/UIState";
import { ConnectionsProvider } from "slices/connections";
import { FeaturesProvider } from "slices/features";
import { LoadingProvider } from "slices/loading";
import { RendererProvider } from "slices/renderers";
import { SettingsProvider } from "slices/settings";
import { SpecimenProvider } from "slices/specimen";
import { theme } from "theme";

const slices = [
  SettingsProvider,
  ConnectionsProvider,
  FeaturesProvider,
  UIStateProvider,
  SpecimenProvider,
  LoadingProvider,
  RendererProvider,
];

const services = [
  ConnectionsService,
  PlaybackService,
  SpecimenService,
  FeaturesService,
  RendererService,
];

render(
  <CssBaseline>
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <EnvironmentProvider slices={slices} services={services}>
          <App />
        </EnvironmentProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </CssBaseline>,
  document.getElementById("root")
);
