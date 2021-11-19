import { createSlice, withLocalStorage } from "./createSlice";

const DEV_PORT = 8001;

export type Remote = {
  url: string;
  transport: string;
  key: string;
  disabled?: boolean;
};

type Settings = {
  remote?: Remote[];
  playbackRate?: number;
};

export const [useSettings, SettingsProvider] = createSlice<Settings>(
  {
    remote: [
      {
        url: `http://localhost:${DEV_PORT}/`,
        transport: "socketio",
        key: "default-development-server",
      },
      {
        url: `https://rachmaninoff.duckdns.org/`,
        transport: "socketio",
        key: "legacy-production-server",
      },
    ],
    playbackRate: 4,
  },
  withLocalStorage("settings")
);
