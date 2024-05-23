import { TabContext, TabList } from "@mui/lab";
import {
  Box,
  Divider,
  Fade,
  Stack,
  Tab,
  Tooltip,
  useTheme,
} from "@mui/material";
import interpolate from "color-interpolate";
import { ViewTree } from "components/inspector/ViewTree";
import { get, set, values } from "lodash";
import { isMobile } from "mobile-device-detect";
import { nanoid } from "nanoid";
import { pages } from "pages";
import { SidebarPage } from "pages/SidebarPage";
import { produce } from "produce";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useSyncStatus } from "services/SyncService";
import { useUIState } from "slices/UIState";
import { PanelState, Root } from "slices/view";

const defaultRoot: Root<PanelState | undefined> = {
  type: "branch",
  orientation: "horizontal",
  key: nanoid(),
  children: [
    {
      type: "leaf",
      content: { type: "explore" },
      key: nanoid(),
      size: 20,
    },
    { type: "leaf", content: undefined, key: nanoid(), size: 80 },
  ],
};

const SIDEBAR = 0;
const CONTENT = 1;

export function useSidebarState() {
  const [{ sidebarOpen: open }, setUIState] = useUIState();
  const setOpen = useCallback(
    (e: boolean) => setUIState(() => ({ sidebarOpen: e })),
    [setUIState]
  );
  const [root, setRoot] = useState(defaultRoot);
  const produceRoot = (f: (obj: Root<PanelState | undefined>) => void) =>
    setRoot(produce(root, f));
  const { Content, derivedRoot, tab } = useMemo(() => {
    const tab = get(root, `children[${SIDEBAR}].content.type`) ?? "";
    const Content = pages[tab]?.content;
    const derivedRoot = produce(root, (r) => {
      if (r.type === "branch") {
        r.locked = !open;
        r.children[SIDEBAR].hidden = !open;
        const size = open
          ? !r.children[SIDEBAR].size
            ? 20
            : r.children[SIDEBAR].size ?? 20
          : 0;
        r.children[SIDEBAR].size = size;
        r.children[CONTENT].size = 100 - size;
      }
    });
    const derivedTab = open ? tab : "";
    return { Content, derivedRoot, tab: derivedTab };
  }, [root, open]);
  return {
    Content,
    tab,
    root: derivedRoot,
    open,
    setOpen,
    produceRoot,
    setRoot,
  };
}

export function useSidebarBackground() {
  const { palette } = useTheme();
  return useMemo(
    () =>
      interpolate([palette.background.paper, palette.text.primary])(
        palette.mode === "dark" ? 0.025 : 0.025
      ),
    [palette]
  );
}

function Divider2() {
  return <Divider sx={{ mx: 2, my: 1 }} />;
}

export function Sidebar({ children }: { children?: ReactNode }) {
  const { isPrimary } = useSyncStatus();
  const { Content, produceRoot, root, setRoot, setOpen, tab, open } =
    useSidebarState();
  const bgcolor = useSidebarBackground();
  const sm2 = isMobile;
  useEffect(() => {
    if (sm2) {
      setOpen(false);
    }
  }, [sm2, setOpen]);
  const sm = !isPrimary || sm2;
  const [, setUIState] = useUIState();
  return (
    <TabContext value={(tab || false) as any}>
      <Stack direction={sm ? "column-reverse" : "row"} sx={{ width: "100%" }}>
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
            borderRight: open
              ? (t) =>
                  `1px solid ${
                    t.palette.mode === "dark"
                      ? t.palette.background.default
                      : t.palette.divider
                  }`
              : "none",
            borderTop: (t) => (sm ? `1px solid ${t.palette.divider}` : "none"),
          }}
        >
          <TabList
            TabIndicatorProps={{ sx: { left: 0, right: "auto" } }}
            onChange={(_, t) => {
              if (!sm) {
                produceRoot(
                  (r) => void set(r, `children[${SIDEBAR}].content.type`, t)
                );
                setOpen(true);
              } else {
                setUIState(() => ({ fullscreenModal: t }));
              }
            }}
            orientation={sm ? "horizontal" : "vertical"}
            sx={sm ? { height: 64, width: "100%" } : { width: 64 }}
          >
            {values(pages)
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
                  onClick={() => {
                    if (!sm) {
                      tab === c.id ? setOpen(false) : setOpen(true);
                    }
                  }}
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
                            strokeWidth: 0.5,
                            stroke: bgcolor,
                          },
                        }}
                      >
                        {c.icon}
                      </Box>
                    </Tooltip>
                  }
                />,
              ])}
          </TabList>
        </Stack>
        <Box sx={{ flex: 1 }}>
          <ViewTree
            onChange={setRoot}
            root={sm ? get(root, "children[1]") : root}
            renderLeaf={(l) =>
              l.content ? (
                <Stack direction="row" sx={{ width: "100%", bgcolor }}>
                  {!!Content && (
                    <Fade in>
                      <Box
                        sx={{
                          flex: 1,
                          height: "100%",
                        }}
                      >
                        <Content template={SidebarPage}></Content>
                      </Box>
                    </Fade>
                  )}
                </Stack>
              ) : (
                children
              )
            }
          />
        </Box>
      </Stack>
    </TabContext>
  );
}
