import { Box, Fade, LinearProgress } from "@mui/material";
import { Sidebar } from "Sidebar";
import { Flex, FlexProps } from "components/generic/Flex";
import { openWindow } from "components/title-bar/window";
import { pages } from "pages";
import { Page } from "pages/Page";
import { PlaceholderPage } from "pages/PlaceholderPage";
import { useUIState } from "slices/UIState";
import { useAnyLoading } from "slices/loading";
import { PanelState, useView } from "slices/view";
import { FileDropZone } from "./FileDropZone";
import { FullscreenModalHost } from "./FullscreenModalHost";
import { FullscreenProgress } from "./FullscreenProgress";
import { ViewTree } from "./ViewTree";

type SpecimenInspectorProps = Record<string, any> & FlexProps;

export function Inspector(props: SpecimenInspectorProps) {
  const loading = useAnyLoading();
  const [{ view }, setView] = useView();
  const [, setUIState] = useUIState();
  return (
    <>
      <Flex {...props}>
        <Sidebar>
          <ViewTree<PanelState>
            onPopOut={(leaf) => {
              openWindow({
                page: leaf.content?.type,
              });
            }}
            onMaximise={(leaf) => {
              setUIState(() => ({ fullscreenModal: leaf.content?.type }));
            }}
            canPopOut={(leaf) => !!pages[leaf.content!.type!]?.allowFullscreen}
            root={view}
            onChange={(v) => setView(() => ({ view: v }))}
            renderLeaf={({ content }) => {
              const Content =
                pages[content?.type ?? ""]?.content ?? PlaceholderPage;
              return (
                <Box sx={{ width: "100%", height: "100%" }}>
                  <Content template={Page} />
                </Box>
              );
            }}
          />
        </Sidebar>
      </Flex>
      <Fade in={loading}>
        <LinearProgress
          variant="indeterminate"
          sx={{ position: "absolute", bottom: 0, width: "100%", zIndex: 1 }}
        />
      </Fade>
      <FullscreenModalHost />
      <FullscreenProgress />
      <FileDropZone />
    </>
  );
}
