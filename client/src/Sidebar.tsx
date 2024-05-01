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
import { useSmallDisplay } from "hooks/useSmallDisplay";
import { get, set, values } from "lodash";
import { nanoid } from "nanoid";
import { pages } from "pages";
import { SidebarPage } from "pages/SidebarPage";
import { produce } from "produce";
import { ReactNode, useMemo, useState } from "react";
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
  const [open, setOpen] = useState(false);
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

export function Sidebar({ children }: { children?: ReactNode }) {
  const { Content, produceRoot, root, setRoot, setOpen, tab, open } =
    useSidebarState();
  const bgcolor = useSidebarBackground();
  const sm = useSmallDisplay();
  return (
    <TabContext value={tab}>
      <Stack direction="row" sx={{ width: "100%" }}>
        {!sm && (
          <Stack
            sx={{
              width: 64,
              alignItems: "center",
              p: 1,
              gap: 1,
              bgcolor: bgcolor,
              borderRight: open
                ? (t) =>
                    `1px solid ${
                      t.palette.mode === "dark"
                        ? t.palette.background.default
                        : t.palette.divider
                    }`
                : "none",
            }}
          >
            <TabList
              TabIndicatorProps={{ sx: { left: 0, right: "auto" } }}
              onChange={(_, t) => {
                produceRoot(
                  (r) => void set(r, `children[${SIDEBAR}].content.type`, t)
                );
                setOpen(true);
              }}
              orientation="vertical"
              sx={{ width: 64 }}
            >
              {values(pages)
                .filter((c) => c.showInSidebar)
                .flatMap((c, i, cx) => [
                  !!i && c.color !== cx[i - 1].color && (
                    <Divider sx={{ mx: 2, my: 1 }} />
                  ),
                  <Tab
                    onClick={() =>
                      tab === c.id ? setOpen(false) : setOpen(true)
                    }
                    key={c.id}
                    value={c.id}
                    sx={{
                      minWidth: 0,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    label={
                      <Tooltip key={c.id} title={c.name} placement="right">
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
        )}
        <Box sx={{ flex: 1 }}>
          <ViewTree
            onChange={setRoot}
            root={root}
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
