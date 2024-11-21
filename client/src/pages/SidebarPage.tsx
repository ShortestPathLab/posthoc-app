import { FullscreenOutlined } from "@mui-symbols-material/w400";
import { Box, Typography } from "@mui/material";
import { useSidebarBackground } from "Sidebar";
import { Flex } from "components/generic/Flex";
import { IconButtonWithTooltip } from "components/generic/IconButtonWithTooltip";
import { Scroll } from "components/generic/Scrollbars";
import { ErrorBoundary } from "react-error-boundary";
import { withSlots } from "components/withSlots";
import { useAcrylic } from "theme";
import { PageProps, PageSlots, divider } from "./Page";
import { useUIState } from "slices/UIState";

export const SidebarPage = withSlots<PageSlots, PageProps>(({ slotProps }) => {
  const bg = useSidebarBackground();
  const acrylic = useAcrylic(bg);
  const [, setUIState] = useUIState();
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
      <Flex vertical>
        <Flex sx={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              bgcolor: bg,
            }}
          >
            {slotProps.Content?.children}
          </Box>
        </Flex>
        <Flex sx={{ height: (t) => t.spacing(6) }}>
          <Flex
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
              <Flex
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
              </Flex>
            </Scroll>
            <IconButtonWithTooltip
              onClick={() => {
                setUIState(() => ({
                  fullscreenModal: slotProps.Key?.children,
                  sidebarOpen: false,
                }));
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
            ></IconButtonWithTooltip>
          </Flex>
        </Flex>
      </Flex>
    </ErrorBoundary>
  );
});
