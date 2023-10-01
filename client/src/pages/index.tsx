import { AccountTreeTwoTone, BugReportTwoTone, InfoTwoTone, LayersTwoTone, ListTwoTone, SettingsInputComponentTwoTone, SettingsTwoTone, SortTwoTone as StepsIcon, ViewInArTwoTone } from "@mui/icons-material";
import { Dictionary } from "lodash";
import { ReactNode } from "react";
import { AboutPage } from "./AboutPage";
import { DebugPage } from "./DebugPage";
import { InfoPage } from "./InfoPage";
import { LayersPage } from "./LayersPage";
import { SettingsPage } from "./SettingsPage";
import { StepsPage } from "./StepsPage";
import { TreePage } from "./TreePage";
import { ViewportPage } from "./ViewportPage";

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
  tree: {
    id: "tree",
    name: "Tree",
    icon: <AccountTreeTwoTone />,
    content: TreePage,
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