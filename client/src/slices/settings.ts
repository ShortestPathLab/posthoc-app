import { AccentColor } from "theme";
import { createSlice, withLocalStorage } from "./createSlice";
import { colors } from "@mui/material";

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

const DEV_PORT = 8001;

export const defaultRemotes = [
  {
    url: `internal://trace/`,
    transport: "native",
    key: "trace-provider",
  },
  {
    url: `http://localhost:${DEV_PORT}/`,
    transport: "socketio",
    key: "default-development-server",
  },
  {
    url: `https://warthog.spaaaacccee.io/`,
    transport: "socketio",
    key: "production-server",
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

export const [useSettings, SettingsProvider] = createSlice<Settings>(
  {
    renderer: defaultRenderers,
    remote: defaultRemotes,
    playbackRate: defaultPlaybackRate,
    theme: "light",
    accentColor: "teal",
  },
  withLocalStorage("settings")
);
