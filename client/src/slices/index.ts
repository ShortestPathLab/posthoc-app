import { layers as layersStore } from "./layers";
import { UI as UIStore } from "./UIState";

import { AuthProvider } from "slices/auth";
import { BusyProvider } from "slices/busy";
import { CloudStorageServiceProvider } from "slices/cloudStorage";
import { ConnectionsProvider } from "slices/connections";
import { FeaturesProvider } from "slices/features";
import { LoadingProvider } from "slices/loading";
import { LogProvider } from "slices/log";
import { RendererProvider } from "slices/renderers";
import { ScreenshotsProvider } from "slices/screenshots";
import { SettingsProvider } from "slices/settings";
import { ViewProvider } from "slices/view";

export const slice = {
  layers: layersStore,
  ui: UIStore,
};

export const layers = layersStore;
export const ui = UIStore;

export const slices = [
  BusyProvider,
  SettingsProvider,
  ConnectionsProvider,
  FeaturesProvider,
  LoadingProvider,
  RendererProvider,
  LogProvider,
  ViewProvider,
  ScreenshotsProvider,
  CloudStorageServiceProvider,
  AuthProvider,
];
