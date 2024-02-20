import { Box, Fade, LinearProgress, Typography } from "@mui/material";
import { Flex, FlexProps } from "components/generic/Flex";
import Modal, { ModalAppBar } from "components/generic/Modal";
import { Scroll } from "components/generic/Scrollbars";
import { Space } from "components/generic/Space";
import { pages } from "pages";
import { Page, Slots } from "pages/Page";
import { ReactNode, createElement, useState } from "react";
import { withSlots } from "react-slot-component";
import { useUIState } from "slices/UIState";
import { useAnyLoading } from "slices/loading";
import { PanelState, useView } from "slices/view";
import { wait } from "utils/timed";
import { FullscreenProgress } from "./FullscreenProgress";
import { ViewTree } from "./ViewTree";
import { WorkspaceDropZone } from "./WorkspaceDropZone";
import { useSmallDisplay } from "hooks/useSmallDisplay";

export type FullscreenPageProps = {
  renderExtras?: (content?: PanelState) => ReactNode;
  controls?: ReactNode;
  children?: ReactNode;
};

export const FullscreenPage = withSlots<Slots, FullscreenPageProps>(
  ({ slotProps }) => {
    const sm = useSmallDisplay();
    return (
      <Box sx={{ height: "100%" }}>
        {!!slotProps.Options?.children && (
          <Flex sx={{ height: (t) => t.spacing(6) }}>
            <Flex
              sx={{
                p: 0,
                zIndex: 1,
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                borderBottom: 1,
                borderColor: "divider",
                alignItems: "center",
                pr: 6,
                background: (t) => t.palette.background.paper,
              }}
            >
              <Scroll x>
                <Flex
                  sx={{
                    width: "max-content",
                    height: (t) => t.spacing(6),
                    alignItems: "center",
                    p: 1,
                  }}
                >
                  {slotProps.Options?.children && (
                    <>{slotProps.Options.children}</>
                  )}
                </Flex>
              </Scroll>
            </Flex>
            <Space sx={{ mx: "auto" }} />
            {slotProps.Extras?.children}
          </Flex>
        )}
        <Box
          sx={{
            bgcolor: "background.paper",
            mt: -6,
            height: "100%",
          }}
        >
          <Scroll y style={{ height: sm ? "100%" : "70vh" }}>
            {slotProps.Content?.children}
          </Scroll>
        </Box>
      </Box>
    );
  }
);

export function FullscreenModalHost() {
  const [{ fullscreenModal: key }, setUIState] = useUIState();
  const [closing, setClosing] = useState(false);
  async function handleClose() {
    setClosing(true);
    await wait(300);
    setUIState(() => ({ fullscreenModal: undefined }));
    setClosing(false);
  }
  const name = key ? pages[key].name : undefined;
  return (
    !!key && (
      <Modal open={!closing} onClose={handleClose} width="70vw">
        <ModalAppBar onClose={handleClose}>
          <Typography variant="h6">{name}</Typography>
        </ModalAppBar>
        {createElement(pages[key].content, {
          template: FullscreenPage,
        })}
      </Modal>
    )
  );
}

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
      <WorkspaceDropZone />
    </>
  );
}
