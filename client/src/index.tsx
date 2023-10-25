import { CssBaseline } from "@mui/material";
import App from "App";
import "index.css";
import "overlayscrollbars/overlayscrollbars.css";
import { createRoot } from "react-dom/client";
import { SliceProvider as EnvironmentProvider } from "slices/SliceProvider";
import { UIStateProvider } from "slices/UIState";
import { ConnectionsProvider } from "slices/connections";
import { FeaturesProvider } from "slices/features";
import { LoadingProvider } from "slices/loading";
import { LogProvider } from "slices/log";
import { RendererProvider } from "slices/renderers";
import { SettingsProvider } from "slices/settings";
import { LayersProvider } from "slices/layers";
import { ViewProvider } from "slices/view";
import { BusyProvider } from "slices/busy";

const root = createRoot(document.getElementById("root")!);

const slices = [
  BusyProvider,
  SettingsProvider,
  ConnectionsProvider,
  FeaturesProvider,
  UIStateProvider,
  LoadingProvider,
  RendererProvider,
  LogProvider,
  ViewProvider,
  LayersProvider,
];

root.render(
  <CssBaseline>
    <EnvironmentProvider slices={slices}>
      <App />
    </EnvironmentProvider>
  </CssBaseline>
);
