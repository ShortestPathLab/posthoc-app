import {
  BugReportOutlined as DebuggerIcon,
  LayersOutlined as LayersIcon,
  ListOutlined as LogsIcon,
  RocketLaunchOutlined as RocketIcon,
  SettingsOutlined as SettingsIcon,
  SegmentOutlined as StepsIcon,
  AccountTreeOutlined as TreeIcon,
  ViewInArOutlined as ViewportIcon,
} from "@mui/icons-material";
import { Dictionary } from "lodash";
import { DebugPage } from "./DebugPage";
import { ExplorePage } from "./ExplorePage";
import { InfoPage } from "./InfoPage";
import { LayersPage } from "./LayersPage";
import { PageMeta } from "./PageMeta";
import { SettingsPage } from "./SettingsPage";
import { StepsPage } from "./StepsPage";
import { TreePage } from "./TreePage";
import { ViewportPage } from "./ViewportPage";

export const pages: Dictionary<PageMeta> = {
  explore: {
    id: "explore",
    name: "Explore",
    color: "pink",
    description: "Browse a library of examples and guides",
    icon: <RocketIcon />,
    content: ExplorePage,
    allowFullscreen: true,
  },
  viewport: {
    id: "viewport",
    name: "Viewport",
    description: "",
    color: "deepPurple",
    icon: <ViewportIcon />,
    content: ViewportPage,
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
  tree: {
    id: "tree",
    name: "Tree",
    description: "",
    color: "deepPurple",
    icon: <TreeIcon />,
    content: TreePage,
  },
  debug: {
    id: "debug",
    name: "Debugger",
    description: "",
    color: "indigo",
    icon: <DebuggerIcon />,
    content: DebugPage,
  },
  info: {
    id: "info",
    name: "Logs",
    description: "",
    color: "grey",
    icon: <LogsIcon />,
    content: InfoPage,
  },
  settings: {
    id: "settings",
    name: "Settings",
    description: "",
    color: "grey",
    icon: <SettingsIcon />,
    content: SettingsPage,
  },
  // about: {
  //   id: "about",
  //   name: "About",
  //   description: "",
  //   color: "grey",
  //   icon: <AboutIcon />,
  //   content: AboutPage,
  // },
};
