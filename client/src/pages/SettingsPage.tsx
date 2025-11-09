import {
  BlurOnRounded,
  CodeRounded,
  DarkModeRounded,
  ExploreRounded,
  FastForwardRounded,
  MemoryAltRounded,
  PaletteRounded,
  RestartAltOutlined,
  RestartAltRounded,
  WorkspacesRounded,
} from "@mui-symbols-material/w400";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
  Tooltip,
  Typography as Type,
  Typography,
} from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Button } from "components/generic/inputs/Button";
import { ListEditor } from "components/generic/list-editor/ListEditor";
import { useSnackbar } from "components/generic/Snackbar";
import { Surface } from "components/generic/surface";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { shades } from "components/renderer/colors";
import { mapParsers } from "components/renderer/map-parser";
import { RendererListEditor } from "components/settings-editor/RendererListEditor";
import { ServerListEditor } from "components/settings-editor/ServerListEditor";
import { useOptimisticTransaction } from "hooks/useOptimistic";
import { useSm } from "hooks/useSmallDisplay";
import { produce } from "immer";
import { findLast, keys, map, startCase } from "lodash-es";
import { ReactNode, Ref, useMemo, useRef, useState } from "react";
import { useMeasure, useRafLoop } from "react-use";
import { slice } from "slices";
import { useBusyState } from "slices/busy";
import { Transaction } from "slices/selector";
import {
  defaultPlaybackRate as baseRate,
  defaults,
  Settings,
} from "slices/settings";
import { AccentColor, getShade, usePaper } from "theme";
import { idle } from "utils/idle";
import { Get, get } from "utils/set";
import { wait } from "utils/timed";
import { AboutContent } from "./AboutPage";
import { PageContentProps } from "./PageMeta";
const formatLabel = (v: number) => `${v}x`;

function Item({
  label,
  icon,
  description,
  children,
}: {
  label: string;
  icon: ReactNode;
  description: string;
  children: ReactNode;
}) {
  const paper = usePaper();
  const [ref, { width }] = useMeasure();
  const sm = width < 320;
  return (
    <Stack
      ref={ref as Ref<HTMLDivElement>}
      direction={sm ? "column" : "row"}
      sx={{
        px: 2,
        py: sm ? 2 : 1,
        gap: sm ? 1 : 4,
        alignItems: sm ? "flex-end" : "center",
        justifyContent: "space-between",
        ...paper(1),
      }}
    >
      <Tooltip placement="top-start" title={`${label}: ${description}`}>
        <ListItem disableGutters disablePadding>
          <ListItemIcon sx={{ mr: -2 }}>{icon}</ListItemIcon>
          <ListItemText
            sx={{
              textOverflow: "ellipsis",
              WebkitLineClamp: 3,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              whiteSpace: "break-spaces",
            }}
            primary={label}
            secondary={description}
          />
        </ListItem>
      </Tooltip>
      {children}
    </Stack>
  );
}

export function SettingsPage({ template: Page }: PageContentProps) {
  "use no memo";
  const { controls, onChange, state, dragHandle, isViewTree } =
    useViewTreeContext();
  const sm = useSm();
  const push = useSnackbar();
  const usingBusyState = useBusyState("reset");
  const {
    "playback/playbackRate": playbackRate = 1,
    "appearance/acrylic": acrylic,
    "appearance/theme": theme = "light",
    "appearance/accentColor": accentColor = "teal",
    "behaviour/showOnStart": showOnStart,
    "performance/workerCount": workerCount = 1,
    "experiments/cloudStorage": cloudStorage = false,
    "experiments/visualScripting": visualScripting = false,
  } = slice.settings.use();
  const [tab, setTab] = useState("general");
  const [ref, { width }] = useMeasure();
  function renderHeading(label: ReactNode) {
    return (
      <Type
        sx={{
          scrollMarginTop: (t) => t.spacing(7),
        }}
        data-label={label}
        component="div"
        variant="overline"
        color="text.secondary"
      >
        {label}
      </Type>
    );
  }
  const items = useRef<HTMLDivElement | null>(null);
  const menu = useRef<HTMLDivElement | null>(null);
  const [generalTab, setGeneralTab] = useState("Playback");
  useRafLoop(() => {
    if (!(items.current && menu.current)) return;
    const itemLabels = Array.from(
      items.current.querySelectorAll<HTMLElement>("[data-label]")
    );
    const menuTop = menu.current.getBoundingClientRect().top;
    const firstTop = findLast(
      itemLabels,
      (l) => l.getBoundingClientRect().top < menuTop + 9
    );
    setGeneralTab(firstTop?.dataset.label ?? "Playback");
  });
  return (
    <TabContext value={tab}>
      <Page onChange={onChange} stack={state}>
        <Page.Key>settings</Page.Key>
        <Page.Title>Settings</Page.Title>
        <Page.Handle>{dragHandle}</Page.Handle>
        <Page.Options>
          <TabList
            onChange={(_, v) => setTab(v)}
            sx={{
              mx: 0,
              "& button": { minWidth: 0 },
            }}
          >
            <Tab label="General" value="general" />
            <Tab label="Extensions" value="connections" />
            <Tab label="Security" value="security" />
            <Tab label="About" value="about" />
          </TabList>
        </Page.Options>
        <Page.Content>
          <Stack sx={{ pt: 6 }} ref={ref as Ref<HTMLDivElement>}>
            <TabPanel value="general" sx={{ p: sm ? 2 : 3 }}>
              <Stack direction="row" sx={{ gap: 2 }}>
                {width > 840 && (
                  <Stack
                    ref={menu}
                    sx={{
                      width: 260,
                      ml: isViewTree ? -3 : -2,
                      my: isViewTree ? -3 : -2,
                      py: isViewTree ? 1 : 2,
                      position: "sticky",
                      top: (t) => t.spacing(6),
                      height: "max-content",
                    }}
                  >
                    <Tabs
                      orientation="vertical"
                      sx={{
                        height: "100%",
                        "& button": {
                          alignItems: "flex-start",
                        },
                      }}
                      value={generalTab}
                    >
                      {[
                        "Playback",
                        "Appearance",
                        "Behaviour",
                        "Performance",
                        "Advanced",
                      ].map((name) => (
                        <Tab
                          key={name}
                          label={name}
                          value={name}
                          onClick={() => {
                            const el = document.querySelector(
                              `[data-label="${name}"]`
                            );
                            if (el) {
                              el.scrollIntoView({
                                block: "start",
                                inline: "start",
                                behavior: "smooth",
                              });
                            }
                          }}
                        />
                      ))}
                    </Tabs>
                  </Stack>
                )}
                <Stack sx={{ gap: 1, flex: 1, pb: "100%" }} ref={items}>
                  {renderHeading("Playback")}
                  <Item
                    label="Playback rate"
                    icon={<FastForwardRounded />}
                    description="The speed at which events are played back, 1x is 60 per second"
                  >
                    <Slider
                      sx={{ width: "fill-available", mx: 2, maxWidth: 320 }}
                      marks={[1, 2, 5, 10].map((v) => ({
                        value: v * baseRate,
                        label: formatLabel(v),
                      }))}
                      step={1 * baseRate}
                      min={1 * baseRate}
                      max={10 * baseRate}
                      valueLabelFormat={(v) => formatLabel(v / baseRate)}
                      valueLabelDisplay="auto"
                      defaultValue={playbackRate}
                      onChangeCommitted={(_, v) =>
                        slice.settings.set((f) => {
                          f["playback/playbackRate"] = +v;
                        })
                      }
                    />
                  </Item>
                  {renderHeading("Appearance")}
                  <Item
                    label="Dark mode"
                    icon={<DarkModeRounded />}
                    description="Whether the app should use a dark theme"
                  >
                    <Switch
                      defaultChecked={theme === "dark"}
                      onChange={(_, v) =>
                        slice.settings.set((f) => {
                          f["appearance/theme"] = v ? "dark" : "light";
                        })
                      }
                    />
                  </Item>
                  <Item
                    label="Accent"
                    icon={<PaletteRounded />}
                    description="The accent color used in the app"
                  >
                    <Box sx={{ my: -0.5 }}>
                      <FeaturePicker
                        paper
                        value={accentColor}
                        items={map(shades, (c) => ({
                          id: c,
                          name: startCase(c),
                          icon: (
                            <Box>
                              <Box
                                sx={{
                                  ml: 0.5,
                                  width: 12,
                                  height: 12,
                                  backgroundColor: getShade(c, theme),
                                  borderRadius: 4,
                                }}
                              />
                            </Box>
                          ),
                        }))}
                        arrow
                        onChange={(v) =>
                          slice.settings.set((f) => {
                            f["appearance/accentColor"] = v as AccentColor;
                          })
                        }
                      />
                    </Box>
                  </Item>
                  <Item
                    label="Acrylic"
                    icon={<BlurOnRounded />}
                    description="Use a subtle transparency effect on UI elements"
                  >
                    <Switch
                      defaultChecked={!!acrylic}
                      onChange={(_, v) =>
                        slice.settings.set((f) => {
                          f["appearance/acrylic"] = v;
                        })
                      }
                    />
                  </Item>
                  {renderHeading("Behaviour")}
                  <Item
                    label="Show explore on start-up"
                    icon={<ExploreRounded />}
                    description="Whether the explore page should show on start-up"
                  >
                    <Switch
                      defaultChecked={!!showOnStart}
                      onChange={(_, v) =>
                        slice.settings.set((f) => {
                          f["behaviour/showOnStart"] = v
                            ? "explore"
                            : undefined;
                        })
                      }
                    />
                  </Item>
                  {renderHeading("Performance")}
                  <Item
                    label="Preferred worker count"
                    icon={<MemoryAltRounded />}
                    description="Set the preferred number of workers. A higher number will improve performance, but also increase memory usage"
                  >
                    <Slider
                      sx={{ width: "fill-available", mx: 2, maxWidth: 320 }}
                      step={1}
                      valueLabelDisplay="auto"
                      min={1}
                      max={navigator.hardwareConcurrency}
                      marks={[
                        {
                          value: 1,
                          label: "1",
                        },
                        {
                          value: navigator.hardwareConcurrency,
                          label: `${navigator.hardwareConcurrency}`,
                        },
                      ]}
                      defaultValue={workerCount}
                      onChangeCommitted={(_, v) =>
                        slice.settings.set((f) => {
                          f["performance/workerCount"] = +v;
                        })
                      }
                    />
                  </Item>
                  {renderHeading("Experiments")}
                  <Item
                    label="Workspace storage API"
                    icon={<WorkspacesRounded />}
                    description="Work in progress. Store your visualisations on GitHub, Google Drive, or locally"
                  >
                    <Switch
                      defaultChecked={cloudStorage}
                      onChange={(_, v) =>
                        slice.settings.set((f) => {
                          f["experiments/cloudStorage"] = v;
                        })
                      }
                    />
                  </Item>
                  <Item
                    label="Flow editor"
                    icon={<CodeRounded />}
                    description="Work in progress. Edit your search traces with a node based editor"
                  >
                    <Switch
                      defaultChecked={visualScripting}
                      onChange={(_, v) =>
                        slice.settings.set((f) => {
                          f["experiments/visualScripting"] = v;
                        })
                      }
                    />
                  </Item>
                  {renderHeading("Advanced")}
                  <Item
                    label="Reset settings and extensions"
                    icon={<RestartAltRounded />}
                    description="If something's not working correctly, you can try to reset all settings and extensions. This cannot be undone."
                  >
                    <Surface
                      trigger={({ open }) => (
                        <Button
                          size="small"
                          sx={{ minWidth: "max-content" }}
                          color="error"
                          startIcon={<RestartAltOutlined />}
                          onClick={open}
                        >
                          Reset now
                        </Button>
                      )}
                      title="Reset settings and extensions"
                    >
                      {({ close }) => (
                        <Stack sx={{ p: sm ? 2 : 3, pt: 2, gap: 4 }}>
                          <Typography component="div" color="text.secondary">
                            If something&apos;s not working correctly, you can
                            try to reset all settings and extensions. This
                            cannot be undone.
                          </Typography>
                          <Stack
                            direction={sm ? "column-reverse" : "row"}
                            justifyContent="flex-end"
                            gap={sm ? 1 : 2}
                          >
                            <Button
                              variant="text"
                              onClick={() => {
                                close();
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                usingBusyState(async () => {
                                  await wait(300);
                                  slice.settings.set(() => defaults);
                                  close();
                                  slice.ui.sidebarOpen.set(false);
                                  slice.ui.fullscreenModal.set(undefined);
                                  push("Reset complete");
                                }, "Resetting settings and extensions");
                              }}
                              color="error"
                              startIcon={<RestartAltOutlined />}
                            >
                              Reset settings and extensions
                            </Button>
                          </Stack>
                        </Stack>
                      )}
                    </Surface>
                  </Item>
                </Stack>
              </Stack>
            </TabPanel>
            <TabPanel value="connections" sx={{ p: 2 }}>
              <Box>
                {renderHeading("Adapters")}
                <ServerListEditor />
              </Box>
              <Box>
                <Divider sx={{ mb: 2 }} />
                {renderHeading("Renderers")}
                <RendererListEditor />
              </Box>
              <Box>
                <Divider sx={{ mb: 2 }} />
                {renderHeading("Map support")}
                <MapParserListEditor />
              </Box>
            </TabPanel>
            <TabPanel value="security" sx={{ p: 2 }}>
              {renderHeading("Trusted origins")}
              <Box sx={{ maxWidth: 480 }}>
                <Typography
                  component="div"
                  color="text.secondary"
                  variant="caption"
                  sx={{ pt: 2 }}
                >
                  Rendering traces in the viewport and using advanced debugger
                  features sometimes requires running third-party code.
                </Typography>
                <Typography
                  component="div"
                  color="text.secondary"
                  variant="caption"
                  sx={{ pt: 2 }}
                >
                  You&apos;ll be prompted to add origins when necessary, and you
                  can stop trusting origins by removing them from this list.
                </Typography>
              </Box>
              <Box sx={{ pt: 2 }}>
                <TrustedOriginListEditor />
              </Box>
            </TabPanel>
            <TabPanel value="about" sx={{ p: 2 }}>
              <Box>
                <AboutContent />
              </Box>
            </TabPanel>
          </Stack>
        </Page.Content>
        <Page.Extras>{controls}</Page.Extras>
      </Page>
    </TabContext>
  );
}

const a = keys(mapParsers).map((c) => ({ key: c }));
type A = (typeof a)[number];

export function useSetting<TPath extends keyof Settings>(
  key: TPath,
  def: Exclude<Get<Settings, TPath>, undefined | void>
) {
  "use no memo";
  const settings = slice.settings.use();
  return useOptimisticTransaction(
    get(settings, key)! ?? def,
    (f: Transaction<Exclude<Get<Settings, TPath>, undefined | void>>) =>
      idle(() =>
        slice.settings.set((prev) => {
          prev[key] = produce(get(prev, key) ?? def, f) as any;
        })
      )
  );
}

export function TrustedOriginListEditor() {
  const [trustedOrigins, setTrustedOrigins] = useSetting("trustedOrigins", []);
  const b = useMemo(
    () =>
      map(trustedOrigins, (t) => ({
        key: t,
      })),
    [trustedOrigins]
  );
  return (
    // <List>
    //   {keys(mapParsers).map((c) => (
    //     <ListItem key={c}>
    //       <ListItemText primary={c} secondary={"Internal"} />
    //     </ListItem>
    //   ))}
    // </List>
    <Box sx={{ mx: -2 }}>
      <ListEditor
        button={false}
        sortable
        addable={false}
        deletable
        renderEditor={({ handle, props: { id: key }, extras }) => (
          <>
            {handle}
            <ListItemText primary={key} />
            {extras}
          </>
        )}
        icon={null}
        value={b}
        onChange={(f) =>
          setTrustedOrigins((prev) => {
            const next = map(prev, (v) => ({ key: v }));
            f(next);
            return map(next, "key");
          })
        }
        create={() => ({
          key: "",
        })}
      />
    </Box>
  );
}
export function MapParserListEditor() {
  return (
    // <List>
    //   {keys(mapParsers).map((c) => (
    //     <ListItem key={c}>
    //       <ListItemText primary={c} secondary={"Internal"} />
    //     </ListItem>
    //   ))}
    // </List>
    <Box sx={{ mx: -2 }}>
      <ListEditor<A>
        button={false}
        sortable
        addable={false}
        deletable={false}
        renderEditor={({ props: { id: key }, handle, extras }) => (
          <>
            {handle}
            <ListItemText
              primary={startCase(key)}
              secondary={`Support for *.${key} maps`}
            />
            {extras}
          </>
        )}
        icon={null}
        value={a}
        // onChange={debounce((v) => slice.settings.set(() => ({ remote: v })), 300)}
        create={() => ({
          key: "",
        })}
      />
    </Box>
  );
}
