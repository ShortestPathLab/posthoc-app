import {
  InfoOutlined as AboutIcon,
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
import { AboutPage } from "./AboutPage";
import { DebugPage } from "./DebugPage";
import { ExplorePage } from "./ExplorePage";
import { InfoPage } from "./InfoPage";
import { LayersPage } from "./LayersPage";
import { SettingsPage } from "./SettingsPage";
import { StepsPage } from "./StepsPage";
import { TreePage } from "./TreePage";
import { ViewportPage } from "./ViewportPage";
import { Page } from "./Page";
import { PageMeta } from "./PageMeta";

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
