import {
  CodeOutlined as CodeOutlinedThin,
  BugReportOutlined as DebuggerIconThin,
  LayersOutlined as LayersIconThin,
  ListOutlined as ListOutlinedThin,
  RocketLaunchOutlined as RocketIconThin,
  SettingsOutlined as SettingsIconThin,
  SegmentOutlined as StepsIconThin,
  AccountTreeOutlined as TreeIconThin,
  ViewInArOutlined as ViewportIconThin,
} from "@mui-symbols-material/w300";
import {
  CodeOutlined,
  BugReportOutlined as DebuggerIcon,
  LayersOutlined as LayersIcon,
  ListOutlined,
  RocketLaunchOutlined as RocketIcon,
  SettingsOutlined as SettingsIcon,
  SegmentOutlined as StepsIcon,
  AccountTreeOutlined as TreeIcon,
  ViewInArOutlined as ViewportIcon,
} from "@mui-symbols-material/w400";
import { Dictionary } from "lodash";
import { DebugPage } from "./DebugPage";
import { ExplorePage } from "./ExplorePage";
import { InfoPage } from "./InfoPage";
import { LayersPage } from "./LayersPage";
import { PageMeta } from "./PageMeta";
import { SettingsPage } from "./SettingsPage";
import { SourcePage } from "./SourcePage";
import { StepsPage } from "./StepsPage";
import { TreePage } from "./tree/TreePage";
import { ViewportPage } from "./ViewportPage";

export const pages: Dictionary<PageMeta> = {
  explore: {
    id: "explore",
    name: "Explore",
    color: "deepOrange",
    description: "Browse examples and guides",
    icon: <RocketIcon />,
    iconThin: <RocketIconThin />,
    content: ExplorePage,
    allowFullscreen: true,
    showInSidebar: "always",
  },
  layers: {
    id: "layers",
    name: "Layers",
    description: "",
    color: "pink",
    icon: <LayersIcon />,
    iconThin: <LayersIconThin />,
    content: LayersPage,
    allowFullscreen: true,
    showInSidebar: "mobile-only",
  },
  steps: {
    id: "steps",
    name: "Events",
    description: "",
    color: "pink",
    icon: <StepsIcon />,
    iconThin: <StepsIconThin />,
    content: StepsPage,
    allowFullscreen: true,
  },
  viewport: {
    id: "viewport",
    name: "Viewport",
    description: "",
    color: "deepPurple",
    icon: <ViewportIcon />,
    iconThin: <ViewportIconThin />,
    content: ViewportPage,
    allowFullscreen: true,
  },
  tree: {
    id: "tree",
    name: "Graph",
    description: "",
    color: "deepPurple",
    icon: <TreeIcon />,
    iconThin: <TreeIconThin />,
    content: TreePage,
    allowFullscreen: true,
  },
  source: {
    id: "source",
    name: "Sources",
    description: "",
    color: "deepPurple",
    icon: <CodeOutlined />,
    iconThin: <CodeOutlinedThin />,
    content: SourcePage,
    allowFullscreen: true,
    showInSidebar: "mobile-only",
  },
  debug: {
    id: "debug",
    name: "Debugger",
    description: "",
    color: "indigo",
    icon: <DebuggerIcon />,
    iconThin: <DebuggerIconThin />,
    content: DebugPage,
    allowFullscreen: true,
    showInSidebar: "mobile-only",
  },
  info: {
    id: "info",
    name: "Logs",
    description: "",
    color: "grey",
    icon: <ListOutlined />,
    iconThin: <ListOutlinedThin />,
    content: InfoPage,
    allowFullscreen: true,
  },
  settings: {
    id: "settings",
    name: "Settings",
    description: "",
    color: "grey",
    icon: <SettingsIcon />,
    iconThin: <SettingsIconThin />,
    content: SettingsPage,
    allowFullscreen: true,
    showInSidebar: "always",
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
