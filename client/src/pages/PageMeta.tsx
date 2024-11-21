import { ReactElement, ReactNode } from "react";
import { withSlots } from "components/withSlots";
import { AccentColor } from "theme";
import { PageProps, PageSlots } from "./Page";

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
  content: (props: PageContentProps) => ReactNode;
  allowFullscreen?: boolean;
  showInSidebar?: "never" | "mobile-only" | "always";
};
