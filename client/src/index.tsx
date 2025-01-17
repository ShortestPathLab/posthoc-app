import "./requestIdleCallbackPolyfill";
import App from "App";
import "index.css";
import "overlayscrollbars/overlayscrollbars.css";
import { createRoot } from "react-dom/client";
import { SliceProvider as EnvironmentProvider } from "slices/SliceProvider";
import { UIStateProvider } from "slices/UIState";
import { AuthProvider } from "slices/auth";
import { BusyProvider } from "slices/busy";
import { CloudStorageServiceProvider } from "slices/cloudStorage";
import { ConnectionsProvider } from "slices/connections";
import { FeaturesProvider } from "slices/features";
import { LayersProvider } from "slices/layers";
import { LoadingProvider } from "slices/loading";
import { LogProvider } from "slices/log";
import { RendererProvider } from "slices/renderers";
import { ScreenshotsProvider } from "slices/screenshots";
import { SettingsProvider } from "slices/settings";
import { ViewProvider } from "slices/view";

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
  ScreenshotsProvider,
  CloudStorageServiceProvider,
  AuthProvider,
];

root.render(
  <EnvironmentProvider slices={slices}>
    <App />
  </EnvironmentProvider>
);
