import { CssBaseline } from "@mui/material";
import { createRoot } from "react-dom/client";
import App from "App";
import { ConnectionsProvider } from "slices/connections";
import { FeaturesProvider } from "slices/features";
import { LoadingProvider } from "slices/loading";
import { LogProvider } from "slices/log";
import { PlaybackProvider } from "slices/playback";
import { RendererProvider } from "slices/renderers";
import { SettingsProvider } from "slices/settings";
import { SliceProvider as EnvironmentProvider } from "slices/SliceProvider";
import { SpecimenProvider } from "slices/specimen";
import { UIStateProvider } from "slices/UIState";
import { ViewProvider } from "slices/view";
import "index.css";
import "overlayscrollbars/overlayscrollbars.css";

const root = createRoot(document.getElementById("root")!);

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

root.render(
  <CssBaseline>
    <EnvironmentProvider slices={slices}>
      <App />
    </EnvironmentProvider>
  </CssBaseline>
);
