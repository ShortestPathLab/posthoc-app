import type { pages } from "pages";
import { createSlice, withLocalStorage } from "./createSlice";
import { AccentColor } from "theme";
import { cloudStorageProviders } from "services/cloud-storage";
import { keys } from "lodash-es";

export type Sources = {
  trustedOrigins?: string[];
};

export type Remote = {
  url: string;
  transport: string;
  key: string;
  disabled?: boolean;
};

export type Renderer = {
  url: string;
  key: string;
  transport: string;
  disabled?: boolean;
};

export type Settings = {
  remote?: Remote[];
  renderer?: Renderer[];
  cloudStorageType?: keyof typeof cloudStorageProviders;
  "playback/playbackRate"?: number;
  "appearance/acrylic"?: boolean;
  "appearance/theme"?: "dark" | "light";
  "appearance/accentColor"?: AccentColor;
  "behaviour/showOnStart"?: keyof typeof pages;
} & Sources;

export const defaultRemotes = [
  {
    url: `internal://basic-maps`,
    transport: "native",
    key: "default-internal",
  },
  {
    url: `https://cdn.jsdelivr.net/gh/ShortestPathLab/posthoc-app@adapter-warthog-wasm-dist/warthog-wasm.mjs`,
    transport: "ipc",
    key: "default-ipc",
  },
];

export const defaultRenderers = [
  {
    url: `internal://d2-renderer/`,
    key: "d2-renderer",
    transport: "native",
  },
  {
    url: `internal://d2-minimal-renderer/`,
    key: "d2-minimal-renderer",
    transport: "native",
  },
];

export const defaultPlaybackRate = 1;

// export const defaultAuthState = {
//   accessToken: null,
//   createdTimestamp: null,
//   expiresIn: null,
// };

export const defaultCloudStorage = keys(
  cloudStorageProviders
)[0] as keyof typeof cloudStorageProviders;

export const defaults = {
  renderer: defaultRenderers,
  remote: defaultRemotes,
  trustedOrigins: [],
  cloudStorageType: defaultCloudStorage,
  "playback/playbackRate": defaultPlaybackRate,
  "appearance/theme": "dark",
  "appearance/acrylic": true,
  "appearance/accentColor": "blue",
  "behaviour/showOnStart": "explore",
} as Settings;

export const [useSettings, SettingsProvider] = createSlice<Settings>(
  {},
  withLocalStorage("settings", defaults)
);
