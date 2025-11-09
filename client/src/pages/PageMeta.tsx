import { withSlots } from "components/withSlots";
import { ReactElement } from "react";
import { AccentColor } from "theme";
import { PageProps, PageSlots } from "./Page";
import { Settings } from "slices/settings";

export type PageContentProps = {
  template: ReturnType<typeof withSlots<PageSlots, PageProps>>;
};

export type PageMeta = {
  id: string;
  name: string;
  icon: ReactElement;
  iconThin?: ReactElement;
  color?: AccentColor;
  description?: string;
  content: (props: PageContentProps) => ReactElement;
  allowFullscreen?: boolean;
  showInSidebar?: "never" | "mobile-only" | "always";
  experiment?: keyof Settings;
};
