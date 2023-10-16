import {
  AccountTreeOutlined,
  BugReportOutlined,
  InfoOutlined,
  LayersOutlined,
  ListOutlined,
  SettingsInputComponentOutlined,
  SettingsOutlined,
  SortOutlined as StepsIcon,
  ViewInArOutlined,
} from "@mui/icons-material";
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
    icon: <ViewInArOutlined />,
    content: ViewportPage,
  },
  tree: {
    id: "tree",
    name: "Tree",
    icon: <AccountTreeOutlined />,
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
    icon: <ListOutlined />,
    content: InfoPage,
  },
  layers: {
    id: "layers",
    name: "Layers",
    icon: <LayersOutlined />,
    content: LayersPage,
  },
  debug: {
    id: "debug",
    name: "Debugger",
    icon: <BugReportOutlined />,
    content: DebugPage,
  },
  settings: {
    id: "settings",
    name: "Settings",
    icon: <SettingsOutlined />,
    content: SettingsPage,
  },
  about: {
    id: "about",
    name: "About",
    icon: <InfoOutlined />,
    content: AboutPage,
  },
};
