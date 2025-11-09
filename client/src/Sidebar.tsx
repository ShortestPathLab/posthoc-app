import { TabContext, TabList } from "@mui/lab";
import {
  Box,
  Divider,
  Skeleton,
  Stack,
  Tab,
  Tooltip,
  useTheme,
} from "@mui/material";
import interpolate from "color-interpolate";
import { times, values } from "lodash-es";
import { isMobile } from "mobile-device-detect";
import { pages } from "pages";
import { useMemo } from "react";
import { useSyncStatus } from "services/SyncService";
import { slice } from "slices";

export function useSidebarBackground() {
  const { palette } = useTheme();
  return useMemo(() => {
    const dark = palette.mode === "dark";
    return dark
      ? interpolate([palette.background.paper, palette.text.primary])(0.025)
      : interpolate([palette.background.paper, palette.background.default])(
          0.25
        );
  }, [palette]);
}

export function SidebarPlaceholder() {
  const bgcolor = useSidebarBackground();
  return (
    <Stack
      sx={{
        minWidth: 64,
        width: 64,
        flex: 0,
        height: "100%",
        bgcolor,
        gap: 2,
        p: 2,
      }}
    >
      {times(3, () => (
        <Skeleton
          variant="circular"
          animation={false}
          sx={{ opacity: 0.5, height: 32 }}
        />
      ))}
    </Stack>
  );
}

function Divider2() {
  return <Divider sx={{ mx: 2, my: 1 }} />;
}

export function Sidebar() {
  "use no memo";
  const { isPrimary } = useSyncStatus();
  const bgcolor = useSidebarBackground();
  const sm2 = isMobile;
  const sm = !isPrimary || sm2;
  const settings = slice.settings.use();
  return (
    <TabContext value={false as unknown as string}>
      <Stack
        sx={{
          display: isPrimary ? "flex" : "none",
          direction: sm ? "row" : "column",
          width: sm ? "100%" : 64,
          height: sm ? 64 : "100%",
          alignItems: "center",
          p: 1,
          gap: sm ? 0 : 1,
          bgcolor,
          borderTop: (t) => (sm ? `1px solid ${t.palette.divider}` : "none"),
        }}
      >
        <TabList
          TabIndicatorProps={{ sx: { left: 0, right: "auto" } }}
          onChange={(_, t) => {
            slice.ui.fullscreenModal.set(t);
          }}
          orientation={sm ? "horizontal" : "vertical"}
          sx={sm ? { height: 64, width: "100%" } : { width: 64 }}
        >
          {values(pages)
            .filter((p) => (p.experiment ? settings[p.experiment] : true))
            .filter((c) =>
              sm
                ? c.showInSidebar === "always" ||
                  c.showInSidebar === "mobile-only"
                : c.showInSidebar === "always"
            )
            .flatMap((c, i, cx) => [
              !sm && !!i && c.color !== cx[i - 1].color && (
                <Divider2 key={`divider-${i}`} />
              ),
              <Tab
                key={c.id}
                value={c.id}
                sx={{
                  minWidth: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                label={
                  <Tooltip
                    key={c.id}
                    title={c.name}
                    placement={sm ? "top" : "right"}
                  >
                    <Box
                      sx={{
                        alignItems: "center",
                        display: "flex",
                        "> svg > path": {
                          strokeWidth: 1,
                          stroke: bgcolor,
                        },
                      }}
                    >
                      {c.iconThin ?? c.icon}
                    </Box>
                  </Tooltip>
                }
              />,
            ])}
        </TabList>
      </Stack>
    </TabContext>
  );
}
