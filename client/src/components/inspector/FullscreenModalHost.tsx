import { alpha, Box, Stack, Typography } from "@mui/material";
import { Block } from "components/generic/Block";
import { Scroll } from "components/generic/Scrollbars";
import { SurfaceBase } from "components/generic/surface";
import { withSlots } from "components/withSlots";
import { useSm } from "hooks/useSmallDisplay";
import { usePopupState } from "material-ui-popup-state/hooks";
import { pages } from "pages";
import { PageSlots } from "pages/Page";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
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
    const sm = useSm();
    const acrylic = useAcrylic();
    return (
      <Stack sx={{ height: "auto", minHeight: "70dvh" }}>
        {!!slotProps.Options?.children && (
          <Stack
            sx={{
              minHeight: (t) => t.spacing(6),
              flex: 0,
              position: "sticky",
              top: 0,
              zIndex: 1,
              width: "100%",
              height: (t) => t.spacing(6),
            }}
          >
            <Stack
              direction="row"
              sx={{
                p: 0,
                zIndex: 1,
                width: "100%",
                borderBottom: 1,
                borderColor: "divider",
                alignItems: "center",
                pr: sm ? 0 : 6,
                ...acrylic,
                background: (t) =>
                  `linear-gradient(to bottom, ${
                    t.palette.background.paper
                  }, ${alpha(t.palette.background.paper, 0.75)})`,
              }}
            >
              <Scroll x>
                <Block
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
                </Block>
              </Scroll>
              {slotProps.Extras?.children}
            </Stack>
          </Stack>
        )}
        <Box
          sx={{
            bgcolor: "background.paper",
            mt: slotProps.Options?.children ? -6 : 0,
            flex: 1,
            position: "relative",
          }}
        >
          {slotProps.Content?.children}
        </Box>
      </Stack>
    );
  }
);

export function FullscreenModalHost() {
  const sm = useSm();
  const [{ fullscreenModal: key }, setUIState] = useUIState();
  const popupState = usePopupState({ variant: "dialog" });
  const handleClose = useCallback(
    async function () {
      await wait(300);
      setUIState(() => ({ fullscreenModal: undefined }));
    },
    [setUIState]
  );
  const state = useMemo(
    () => ({
      ...popupState,
      close: () => {
        handleClose();
        popupState.close();
      },
    }),
    [handleClose, popupState]
  );
  useEffect(() => {
    if (key) {
      popupState.open();
    }
  }, [key]);

  const value = useMemo(() => ({ close: state.close }), [state]);

  const page = key ? pages[key] : undefined;

  const content = useMemo(() => {
    if (!page) return;
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
  }, [key, page]);

  return (
    <FullscreenModalContext.Provider {...{ value }}>
      {!!page && (
        <SurfaceBase
          title={
            <Typography sx={{ px: 2, pb: 1 }} variant="h6">
              {page.name}
            </Typography>
          }
          state={state}
          slotProps={{
            ...(sm
              ? {}
              : {
                  paper: { sx: { maxWidth: "70vw" } },
                }),
          }}
        >
          {content}
        </SurfaceBase>
      )}
    </FullscreenModalContext.Provider>
  );
}
