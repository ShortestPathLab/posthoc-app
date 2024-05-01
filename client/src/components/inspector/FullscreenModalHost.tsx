import { Box, Stack, Typography, alpha } from "@mui/material";
import { Flex } from "components/generic/Flex";
import Modal, { ModalAppBar } from "components/generic/Modal";
import { Scroll } from "components/generic/Scrollbars";
import { useConnection } from "hooks/useConnectionResolver";
import { useSmallDisplay } from "hooks/useSmallDisplay";
import { pages } from "pages";
import { PageSlots } from "pages/Page";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { withSlots } from "react-slot-component";
import { useUIState } from "slices/UIState";
import { PanelState } from "slices/view";
import { useAcrylic } from "theme";
import { wait } from "utils/timed";

const FullscreenModalContext = createContext<{ close?: () => void }>({});

export function useFullscreenModalContext() {
  return useContext(FullscreenModalContext);
}

export type FullscreenPageProps = {
  renderExtras?: (content?: PanelState) => ReactNode;
  controls?: ReactNode;
  children?: ReactNode;
};

export const FullscreenPage = withSlots<PageSlots, FullscreenPageProps>(
  ({ slotProps }) => {
    const sm = useSmallDisplay();
    const acrylic = useAcrylic();
    return (
      <Stack
        sx={{ height: sm ? "calc(100%  - 56px)" : "100%", minHeight: "70vh" }}
      >
        {!!slotProps.Options?.children && (
          <Stack sx={{ minHeight: (t) => t.spacing(6), flex: 0 }}>
            <Stack
              direction="row"
              sx={{
                p: 0,
                zIndex: 1,
                width: "100%",
                borderBottom: 1,
                borderColor: "divider",
                alignItems: "center",
                pr: 6,
                ...acrylic,
                background: (t) =>
                  sm
                    ? `linear-gradient(to bottom, ${
                        t.palette.background.default
                      }, ${alpha(t.palette.background.default, 0.75)})`
                    : `linear-gradient(to bottom, ${
                        t.palette.background.paper
                      }, ${alpha(t.palette.background.paper, 0.75)})`,
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
            </Stack>
          </Stack>
        )}
        <Box
          sx={{
            bgcolor: sm ? "background.default" : "background.paper",
            mt: -6,
            flex: 1,
            position: "relative",
          }}
        >
          <Scroll y style={{ height: "100%", position: "absolute" }}>
            {slotProps.Content?.children}
          </Scroll>
        </Box>
      </Stack>
    );
  }
);

export function FullscreenModalHost() {
  const [{ fullscreenModal: key }, setUIState] = useUIState();
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(
    async function () {
      setClosing(true);
      await wait(300);
      setUIState(() => ({ fullscreenModal: undefined }));
      setClosing(false);
    },
    [setUIState]
  );

  const value = useMemo(() => ({ close: handleClose }), [handleClose]);

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
    <FullscreenModalContext.Provider {...{ value }}>
      {!!page && (
        <Modal open={!closing} onClose={handleClose} width="70vw">
          <ModalAppBar onClose={handleClose}>
            <Typography variant="h6">{page.name}</Typography>
          </ModalAppBar>
          {content}
        </Modal>
      )}
    </FullscreenModalContext.Provider>
  );
}
