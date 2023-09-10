import { CssBaseline } from "@mui/material";
import App from "App";
import "index.css";
import "overlayscrollbars/overlayscrollbars.css";
import { createRoot } from "react-dom/client";
import { ConnectionsService } from "services/ConnectionsService";
import { FeaturesService } from "services/FeaturesService";
import { RendererService } from "services/RendererService";
import { SliceProvider as EnvironmentProvider } from "slices/SliceProvider";
import { UIStateProvider } from "slices/UIState";
import { ConnectionsProvider } from "slices/connections";
import { FeaturesProvider } from "slices/features";
import { LoadingProvider } from "slices/loading";
import { LogProvider } from "slices/log";
import { PlaybackProvider } from "slices/playback";
import { RendererProvider } from "slices/renderers";
import { SettingsProvider } from "slices/settings";
import { SpecimenProvider } from "slices/specimen";
import { ViewProvider } from "slices/view";

const slices = [
  SettingsProvider,
  ConnectionsProvider,
  FeaturesProvider,
  UIStateProvider,
  SpecimenProvider,
  LoadingProvider,
  RendererProvider,
  PlaybackProvider,
  LogProvider,
  ViewProvider,
];

const services = [ConnectionsService, FeaturesService, RendererService];

const root = createRoot(document.getElementById("root")!);

root.render(
  <CssBaseline>
    <EnvironmentProvider slices={slices} services={services}>
      <App />
    </EnvironmentProvider>
  </CssBaseline>
);
