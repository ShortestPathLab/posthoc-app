import { Box, Fade, LinearProgress } from "@mui/material";
import { Flex, FlexProps } from "components/generic/Flex";
import { pages } from "pages";
import { Page } from "pages/Page";
import { createElement } from "react";
import { useUIState } from "slices/UIState";
import { useAnyLoading } from "slices/loading";
import { PanelState, useView } from "slices/view";
import { FullscreenProgress } from "./FullscreenProgress";
import { ViewTree } from "./ViewTree";
import { FileDropZone } from "./FileDropZone";
import { FullscreenModalHost } from "./FullscreenModalHost";

type SpecimenInspectorProps = Record<string, any> & FlexProps;

export function Inspector(props: SpecimenInspectorProps) {
  const loading = useAnyLoading();
  const [{ view }, setView] = useView();
  const [, setUIState] = useUIState();

  return (
    <>
      <Flex {...props}>
        <ViewTree<PanelState>
          onPopOut={(leaf) =>
            setUIState(() => ({ fullscreenModal: leaf.content?.type }))
          }
          canPopOut={(leaf) => !!pages[leaf.content!.type!]?.allowFullscreen}
          root={view}
          onChange={(v) => setView(() => ({ view: v }))}
          renderLeaf={({ content }) => (
            <Box sx={{ width: "100%", height: "100%" }}>
              {createElement(pages[content?.type ?? ""]?.content, {
                template: Page,
              })}
            </Box>
          )}
        />
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
