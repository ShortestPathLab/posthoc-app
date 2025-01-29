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
import { UIStateProvider } from "slices/UIState";
import { ViewProvider } from "slices/view";

export const slices = [
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
