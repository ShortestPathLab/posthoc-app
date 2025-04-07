import { Box, Fade, LinearProgress } from "@mui/material";
import { Sidebar } from "Sidebar";
import { Block, BlockProps } from "components/generic/Block";
import { openWindow } from "components/title-bar/window";
import { produce } from "immer";
import { isEqual } from "lodash-es";
import { isMobile } from "mobile-device-detect";
import { pages } from "pages";
import { Page } from "pages/Page";
import { PlaceholderPage } from "pages/PlaceholderPage";
import { ErrorBoundary } from "react-error-boundary";
import { slice } from "slices";
import { useAnyLoading } from "slices/loading";
import { PanelState } from "slices/view";
import { FileDropZone } from "./FileDropZone";
import { FullscreenModalHost } from "./FullscreenModalHost";
import { FullscreenProgress } from "./FullscreenProgress";
import { ErrorPlaceholder } from "./Placeholder";
import { ViewTree } from "./ViewTree";

function useView() {
  "use no memo";
  return slice.view.use((v) => v.view, isEqual);
}

export function Inspector(props: BlockProps) {
  const loading = useAnyLoading();
  const view = useView();
  return (
    <>
      <Block
        {...props}
        sx={{
          flexDirection: isMobile ? "column-reverse" : "row",
        }}
      >
        <Sidebar />
        <ViewTree<PanelState>
          defaultContent={{ type: "" }}
          onPopOut={(leaf) => {
            openWindow({
              page: leaf.content?.type,
            });
          }}
          onMaximise={(leaf) => {
            slice.ui.fullscreenModal.set(leaf.content?.type);
          }}
          canPopOut={(leaf) => !!pages[leaf.content!.type!]?.allowFullscreen}
          root={view}
          onChange={(v) =>
            slice.view.set((l) => void (l.view = produce(l.view, v)))
          }
          renderLeaf={({ content }) => {
            const Content =
              pages[content?.type ?? ""]?.content ?? PlaceholderPage;
            return (
              <Box sx={{ width: "100%", height: "100%" }}>
                <ErrorBoundary
                  fallbackRender={({ error, resetErrorBoundary }) => (
                    <ErrorPlaceholder
                      sx={{ width: "100%", height: "100%" }}
                      label={`An error occurred`}
                      secondary={
                        "message" in error
                          ? error.message
                          : "Couldn't render this view"
                      }
                      onReset={resetErrorBoundary}
                    />
                  )}
                >
                  <Content template={Page} />
                </ErrorBoundary>
              </Box>
            );
          }}
        />
      </Block>
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
