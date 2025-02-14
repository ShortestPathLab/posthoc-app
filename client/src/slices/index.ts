import { layers as layersStore } from "./layers";
import { UI as UIStore } from "./UIState";
import { loading as loadingStore } from "./loading";

import { AuthProvider } from "slices/auth";
import { BusyProvider } from "slices/busy";
import { CloudStorageServiceProvider } from "slices/cloudStorage";
import { ConnectionsProvider } from "slices/connections";
import { FeaturesProvider } from "slices/features";
import { LogProvider } from "slices/log";
import { RendererProvider } from "slices/renderers";
import { ScreenshotsProvider } from "slices/screenshots";
import { SettingsProvider } from "slices/settings";
import { ViewProvider } from "slices/view";

export const slice = {
  layers: layersStore,
  ui: UIStore,
  loading: loadingStore,
};

export const loading = loadingStore;
export const layers = layersStore;
export const ui = UIStore;

export const slices = [
  BusyProvider,
  SettingsProvider,
  ConnectionsProvider,
  FeaturesProvider,
  RendererProvider,
  LogProvider,
  ViewProvider,
  ScreenshotsProvider,
  CloudStorageServiceProvider,
  AuthProvider,
];
