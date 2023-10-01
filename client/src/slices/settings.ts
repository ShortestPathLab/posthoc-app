import { createSlice, withLocalStorage } from "./createSlice";
import { AccentColor } from "theme";

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

type Settings = {
  remote?: Remote[];
  renderer?: Renderer[];
  playbackRate?: number;
  acrylic?: boolean;
  theme?: "dark" | "light";
  accentColor?: AccentColor;
};

export const defaultRemotes = [
  {
    url: `https://cdn.jsdelivr.net/gh/path-visualiser/app@adapter-warthog-wasm-dist/warthog-wasm.mjs`,
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
];

export const defaultPlaybackRate = 4;

const defaults = {
  renderer: defaultRenderers,
  remote: defaultRemotes,
  playbackRate: defaultPlaybackRate,
  theme: "dark",
  acrylic: true,
  accentColor: "blue",
} as Settings;

export const [useSettings, SettingsProvider] = createSlice<Settings>(
  {},
  withLocalStorage("settings", defaults)
);