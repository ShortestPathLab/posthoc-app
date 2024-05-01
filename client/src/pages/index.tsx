import {
  CodeOutlined,
  BugReportOutlined as DebuggerIcon,
  LayersOutlined as LayersIcon,
  ListOutlined,
  CodeOutlined as LogsIcon,
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
import { SourcePage } from "./SourcePage";

export const pages: Dictionary<PageMeta> = {
  explore: {
    id: "explore",
    name: "Explore",
    color: "deepOrange",
    description: "Browse examples and guides",
    icon: <RocketIcon />,
    content: ExplorePage,
    allowFullscreen: true,
    showInSidebar: true,
  },
  layers: {
    id: "layers",
    name: "Layers",
    description: "",
    color: "pink",
    icon: <LayersIcon />,
    content: LayersPage,
    allowFullscreen: true,
  },
  steps: {
    id: "steps",
    name: "Events",
    description: "",
    color: "pink",
    icon: <StepsIcon />,
    content: StepsPage,
    allowFullscreen: true,
  },
  viewport: {
    id: "viewport",
    name: "Viewport",
    description: "",
    color: "deepPurple",
    icon: <ViewportIcon />,
    content: ViewportPage,
    allowFullscreen: true,
  },
  tree: {
    id: "tree",
    name: "Graph",
    description: "",
    color: "deepPurple",
    icon: <TreeIcon />,
    content: TreePage,
    allowFullscreen: true,
  },
  source: {
    id: "source",
    name: "Source",
    description: "",
    color: "deepPurple",
    icon: <CodeOutlined />,
    content: SourcePage,
    allowFullscreen: true,
  },
  debug: {
    id: "debug",
    name: "Debugger",
    description: "",
    color: "indigo",
    icon: <DebuggerIcon />,
    content: DebugPage,
    allowFullscreen: true,
  },
  info: {
    id: "info",
    name: "Logs",
    description: "",
    color: "grey",
    icon: <ListOutlined />,
    content: InfoPage,
    allowFullscreen: true,
  },
  settings: {
    id: "settings",
    name: "Settings",
    description: "",
    color: "grey",
    icon: <SettingsIcon />,
    content: SettingsPage,
    allowFullscreen: true,
    showInSidebar: true,
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
