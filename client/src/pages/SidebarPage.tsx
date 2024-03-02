import { Box, Typography } from "@mui/material";
import { useSidebarBackground } from "Sidebar";
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { withSlots } from "react-slot-component";
import { useAcrylic } from "theme";
import { PageSlots, PageProps, divider } from "./Page";

export const SidebarPage = withSlots<PageSlots, PageProps>(({ slotProps }) => {
  const bg = useSidebarBackground();
  const acrylic = useAcrylic(bg);
  return (
    <ErrorBoundary fallback={<>This page encountered an error.</>}>
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
                <Typography sx={{ p: 1, color: "text.secondary" }}>
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
          </Flex>
        </Flex>
      </Flex>
    </ErrorBoundary>
  );
});
