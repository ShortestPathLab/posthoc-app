import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { Flex } from "components/generic/Flex";
import Modal, { ModalAppBar } from "components/generic/Modal";
import { Scroll } from "components/generic/Scrollbars";
import { Space } from "components/generic/Space";
import { useSmallDisplay } from "hooks/useSmallDisplay";
import { pages } from "pages";
import { PageSlots } from "pages/Page";
import { ReactNode, useMemo, useState } from "react";
import { withSlots } from "react-slot-component";
import { useUIState } from "slices/UIState";
import { useSettings } from "slices/settings";
import { PanelState } from "slices/view";
import { wait } from "utils/timed";

export type FullscreenPageProps = {
  renderExtras?: (content?: PanelState) => ReactNode;
  controls?: ReactNode;
  children?: ReactNode;
};

export const FullscreenPage = withSlots<PageSlots, FullscreenPageProps>(
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
              {slotProps.Extras?.children}
            </Flex>
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

  const page = key ? pages[key] : undefined;

  const content = useMemo(() => {
    if (page) {
      const PageContent = page.content;

      const FullScreenPageTemplate = withSlots<PageSlots, FullscreenPageProps>(
        ({ slotProps, ...props }) => (
          <FullscreenPage {...props}>
            <FullscreenPage.Content>
              {slotProps!.Content?.children}
            </FullscreenPage.Content>
            <FullscreenPage.Options>
              {slotProps!.Options?.children}
            </FullscreenPage.Options>
            <FullscreenPage.Extras>
              {slotProps!.Extras?.children}
            </FullscreenPage.Extras>
          </FullscreenPage>
        )
      );
      return <PageContent template={FullScreenPageTemplate} />;
    }
  }, [key, page]);

  return (
    !!page && (
      <Modal open={!closing} onClose={handleClose} width="70vw">
        <ModalAppBar onClose={handleClose}>
          <Typography variant="h6">{page.name}</Typography>
        </ModalAppBar>
        {content}
      </Modal>
    )
  );
}
