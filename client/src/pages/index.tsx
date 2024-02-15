import {
  AccountTreeOutlined as TreeIcon,
  BugReportOutlined as DebuggerIcon,
  InfoOutlined as AboutIcon,
  LayersOutlined as LayersIcon,
  ListOutlined as LogsIcon,
  SettingsOutlined as SettingsIcon,
  SegmentOutlined as StepsIcon,
  ViewInArOutlined as ViewportIcon,
  WorkspacesOutlined as WorkspacesIcon,
  RocketLaunchOutlined as RocketIcon,
} from "@mui/icons-material";
import { Dictionary } from "lodash";
import { ReactNode } from "react";
import { AccentColor } from "theme";
import { AboutPage } from "./AboutPage";
import { DebugPage } from "./DebugPage";
import { InfoPage } from "./InfoPage";
import { LayersPage } from "./LayersPage";
import { RecipesPage } from "./RecipesPage";
import { SettingsPage } from "./SettingsPage";
import { StepsPage } from "./StepsPage";
import { TreePage } from "./TreePage";
import { ViewportPage } from "./ViewportPage";
import { ExplorePage } from "./ExplorePage";

export type PageMeta = {
  id: string;
  name: string;
  icon: ReactNode;
  color?: AccentColor;
  description?: string;
  content: () => ReactNode;
};

export const pages: Dictionary<PageMeta> = {
  explore: {
    id: "explore",
    name: "Explore",
    color: "pink",
    description: "Browse a library of examples and guides",
    icon: <RocketIcon />,
    content: ExplorePage,
  },
  layers: {
    id: "layers",
    name: "Layers",
    description: "",
    color: "deepPurple",
    icon: <LayersIcon />,
    content: LayersPage,
  },
  steps: {
    id: "steps",
    name: "Steps",
    description: "",
    color: "deepPurple",
    icon: <StepsIcon />,
    content: StepsPage,
  },
  viewport: {
    id: "viewport",
    name: "Viewport",
    description: "",
    color: "indigo",
    icon: <ViewportIcon />,
    content: ViewportPage,
  },
  tree: {
    id: "tree",
    name: "Tree",
    description: "",
    color: "indigo",
    icon: <TreeIcon />,
    content: TreePage,
  },
  debug: {
    id: "debug",
    name: "Debugger",
    description: "",
    color: "lightBlue",
    icon: <DebuggerIcon />,
    content: DebugPage,
  },
  info: {
    id: "info",
    name: "Logs",
    description: "",
    color: "blueGrey",
    icon: <LogsIcon />,
    content: InfoPage,
  },
  settings: {
    id: "settings",
    name: "Settings",
    description: "",
    color: "blueGrey",
    icon: <SettingsIcon />,
    content: SettingsPage,
  },
  about: {
    id: "about",
    name: "About",
    description: "",
    color: "blueGrey",
    icon: <AboutIcon />,
    content: AboutPage,
  },
};
