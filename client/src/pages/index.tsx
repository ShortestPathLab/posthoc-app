import {
  BugReportTwoTone,
  InfoTwoTone,
  LayersTwoTone,
  ListTwoTone,
  SettingsInputComponentTwoTone,
  SettingsTwoTone,
  SortTwoTone as StepsIcon,
  ViewInArTwoTone,
} from "@mui/icons-material";
import { Dictionary } from "lodash";
import { ReactNode } from "react";
import { InfoPage } from "./InfoPage";
import { ViewportPage } from "./ViewportPage";
import { LayersPage } from "./LayersPage";
import { DebugPage } from "./DebugPage";
import { StepsPage } from "./StepsPage";
import { SettingsPage } from "./SettingsPage";
import { AboutPage } from "./AboutPage";

export type PageMeta = {
  id: string;
  name: string;
  icon: ReactNode;
  content: () => ReactNode;
};

export const pages: Dictionary<PageMeta> = {
  viewport: {
    id: "viewport",
    name: "Viewport",
    icon: <ViewInArTwoTone />,
    content: ViewportPage,
  },
  steps: {
    id: "steps",
    name: "Steps",
    icon: <StepsIcon />,
    content: StepsPage,
  },
  info: {
    id: "info",
    name: "Logs",
    icon: <ListTwoTone />,
    content: InfoPage,
  },
  layers: {
    id: "layers",
    name: "Layers",
    icon: <LayersTwoTone />,
    content: LayersPage,
  },
  parameters: {
    id: "parameters",
    name: "Parameters",
    icon: <SettingsInputComponentTwoTone />,
    content: InfoPage,
  },
  debug: {
    id: "debug",
    name: "Debugger",
    icon: <BugReportTwoTone />,
    content: DebugPage,
  },
  settings: {
    id: "settings",
    name: "Settings",
    icon: <SettingsTwoTone />,
    content: SettingsPage,
  },
  about: {
    id: "about",
    name: "About",
    icon: <InfoTwoTone />,
    content: AboutPage,
  },
};
