import { AuthProvider } from "slices/auth";
import { BusyProvider } from "slices/busy";
import { CloudStorageServiceProvider } from "slices/cloudStorage";
import { ConnectionsProvider } from "slices/connections";
import { FeaturesProvider } from "slices/features";
import { LogProvider } from "slices/log";
import { RendererProvider } from "slices/renderers";
import { ScreenshotsProvider } from "slices/screenshots";
import { layers as layersStore } from "./layers";
import { loading as loadingStore } from "./loading";
import { settings as settingsStore } from "./settings";
import { UI as UIStore } from "./UIState";
import { viewStore } from "./view";

export const slice = {
  layers: layersStore,
  ui: UIStore,
  view: viewStore,
  loading: loadingStore,
  settings: settingsStore,
};

export const settings = settingsStore;
export const loading = loadingStore;
export const layers = layersStore;
export const ui = UIStore;

export const slices = [
  BusyProvider,
  ConnectionsProvider,
  FeaturesProvider,
  RendererProvider,
  LogProvider,
  ScreenshotsProvider,
  CloudStorageServiceProvider,
  AuthProvider,
];
