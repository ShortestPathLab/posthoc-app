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
import { Flex } from "components/generic/Flex";
import { ViewTree } from "components/inspector/ViewTree";
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

const LEFT = 0;
const RIGHT = 1;

export function useSidebarState() {
  const [open, setOpen] = useState(false);
  const [root, setRoot] = useState(defaultRoot);
  const produceRoot = (f: (obj: Root<PanelState | undefined>) => void) =>
    setRoot(produce(root, f));
  const { Content, derivedRoot, tab } = useMemo(() => {
    const tab = get(root, `children[${LEFT}].content.type`) ?? "";
    const Content = pages[tab]?.content;
    const derivedRoot = open ? root : get(root, `children[${RIGHT}]`);
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
        palette.mode === "dark" ? 0.0125 : 0.025
      ),
    [palette]
  );
}

export function Sidebar({ children }: { children?: ReactNode }) {
  const { Content, produceRoot, root, setRoot, setOpen, tab } =
    useSidebarState();
  const bgcolor = useSidebarBackground();
  return (
    <TabContext value={tab}>
      <Stack direction="row" sx={{ width: "100%" }}>
        <Stack
          sx={{
            width: 64,
            bgcolor,
            alignItems: "center",
            p: 1,
            gap: 1,
            // bgcolor: "background.paper",
            borderRight: (t) =>
              `1px solid ${
                t.palette.mode === "dark"
                  ? t.palette.background.default
                  : t.palette.divider
              }`,
          }}
        >
          <TabList
            TabIndicatorProps={{ sx: { left: 0, right: "auto" } }}
            onChange={(_, t) => {
              produceRoot(
                (r) => void set(r, `children[${LEFT}].content.type`, t)
              );
              setOpen(true);
            }}
            orientation="vertical"
            sx={{ width: 64 }}
          >
            {values(pages).flatMap((c, i, cx) => [
              !!i && c.color !== cx[i - 1].color && (
                <Divider sx={{ mx: 2, my: 1 }} />
              ),
              <Tab
                onClick={() => (tab === c.id ? setOpen(false) : setOpen(true))}
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
        <Box sx={{ flex: 1 }}>
          <ViewTree
            onChange={setRoot}
            root={root}
            // onDrop={(l) =>
            //   produceRoot(
            //     (c) => void set(c, `children[${LEFT}].content`, l.content)
            //   )
            // }
            renderLeaf={(l) =>
              l.content ? (
                <Stack direction="row" sx={{ width: "100%", bgcolor }}>
                  {!!Content && (
                    <Box
                      sx={{
                        flex: 1,
                        height: "100%",
                      }}
                    >
                      <Content template={SidebarPage}></Content>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Fade in>
                  <Flex>{children}</Flex>
                </Fade>
              )
            }
          />
        </Box>
      </Stack>
    </TabContext>
  );
}
