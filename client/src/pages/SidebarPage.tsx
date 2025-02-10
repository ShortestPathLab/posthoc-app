import { FullscreenOutlined } from "@mui-symbols-material/w400";
import { Box, Typography } from "@mui/material";
import { Block } from "components/generic/Block";
import { IconButtonWithTooltip } from "components/generic/inputs/IconButtonWithTooltip";
import { Scroll } from "components/generic/Scrollbars";
import { withSlots } from "components/withSlots";
import { ErrorBoundary } from "react-error-boundary";
import { useSidebarBackground } from "Sidebar";
import { slice } from "slices";
import { useAcrylic } from "theme";
import { PageContent, PageProps, PageSlots, divider } from "./Page";

export const SidebarPage = withSlots<PageSlots, PageProps>(({ slotProps }) => {
  const bg = useSidebarBackground();
  const acrylic = useAcrylic(bg);
  return (
    <ErrorBoundary
      fallback={
        <Box
          sx={{
            p: 6,
            background: (t) => t.palette.background.paper,
            height: "100%",
          }}
        >
          This page encountered an error.
        </Box>
      }
    >
      <Block vertical>
        <PageContent sx={{ bgcolor: bg }}>
          {slotProps?.Content?.children}
        </PageContent>
        <Block sx={{ height: (t) => t.spacing(6) }}>
          <Block
            sx={{
              p: 0,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              borderBottom: 1,
              borderColor: "divider",
              alignItems: "center",
              ...acrylic,
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
                {/* {slotProps.Handle?.children} */}
                <Typography
                  component="div"
                  sx={{ p: 1, color: "text.secondary" }}
                >
                  {slotProps.Title?.children}
                </Typography>
                {slotProps.Options?.children && (
                  <>
                    {divider}
                    {slotProps.Options.children}
                  </>
                )}
              </Block>
            </Scroll>
            <IconButtonWithTooltip
              onClick={() => {
                slice.ui.fullscreenModal.set(slotProps.Key?.children);
                slice.ui.sidebarOpen.set(false);
              }}
              size="small"
              sx={{ m: 1 }}
              icon={
                <FullscreenOutlined
                  sx={{ color: "text.secondary" }}
                  fontSize="small"
                />
              }
              label="Maximise"
            />
          </Block>
        </Block>
      </Block>
    </ErrorBoundary>
  );
});
