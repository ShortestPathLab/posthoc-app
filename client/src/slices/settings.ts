import { store } from "@davstack/store";
import { keys } from "lodash-es";
import type { pages } from "pages";
import { cloudStorageProviders } from "services/cloud-storage";
import { AccentColor } from "theme";

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
  "performance/workerCount"?: number;
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
  "performance/workerCount": 1,
} as Settings;

export const settings = store<Settings>(
  {},
  {
    name: "settings",
    persist: { enabled: true },
  }
);
