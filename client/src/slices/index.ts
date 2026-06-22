import { auth as authStore } from "slices/auth";
import { busy as busyStore } from "slices/busy";
import { cloudStorage as cloudStorageStore } from "slices/cloudStorage";
import { connections as connectionsStore } from "slices/connections";
import { features as featuresStore } from "slices/features";
import { log as logStore } from "slices/log";
import { renderers as renderersStore } from "slices/renderers";
import { screenshots as screenshotsStore } from "slices/screenshots";
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
  connections: connectionsStore,
  features: featuresStore,
  log: logStore,
  renderers: renderersStore,
  busy: busyStore,
  auth: authStore,
  cloudStorage: cloudStorageStore,
  screenshots: screenshotsStore,
};

export const settings = settingsStore;
export const loading = loadingStore;
export const layers = layersStore;
export const ui = UIStore;
