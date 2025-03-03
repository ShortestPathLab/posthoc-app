import { RestartAltOutlined } from "@mui-symbols-material/w400";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Divider,
  ListItemText,
  Slider,
  Stack,
  Switch,
  Tab,
  Typography as Type,
  Typography,
} from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Block } from "components/generic/Block";
import { Button } from "components/generic/inputs/Button";
import { ListEditor } from "components/generic/list-editor/ListEditor";
import { Scroll } from "components/generic/Scrollbars";
import { useSnackbar } from "components/generic/Snackbar";
import { Space } from "components/generic/Space";
import { Surface } from "components/generic/surface";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { shades } from "components/renderer/colors";
import { mapParsers } from "components/renderer/map-parser";
import { RendererListEditor } from "components/settings-editor/RendererListEditor";
import { ServerListEditor } from "components/settings-editor/ServerListEditor";
import { useOptimisticTransaction } from "hooks/useOptimistic";
import { useSm } from "hooks/useSmallDisplay";
import { $, Objects } from "hotscript";
import { keys, map, startCase } from "lodash-es";
import { produce } from "produce";
import { ReactNode, useMemo, useState } from "react";
import { slice } from "slices";
import { useBusyState } from "slices/busy";
import { Transaction } from "slices/selector";
import {
  defaultPlaybackRate as baseRate,
  defaults,
  Settings,
  useSettings,
} from "slices/settings";
import { AccentColor, getShade } from "theme";
import { idle } from "utils/idle";
import { wait } from "utils/timed";
import { AboutContent } from "./AboutPage";
import { PageContentProps } from "./PageMeta";
import { Get, get } from "utils/set";
const formatLabel = (v: number) => `${v}x`;

export function SettingsPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle, isViewTree } =
    useViewTreeContext();
  const sm = useSm();
  const push = useSnackbar();
  const usingBusyState = useBusyState("reset");
  const [
    {
      "playback/playbackRate": playbackRate = 1,
      "appearance/acrylic": acrylic,
      "appearance/theme": theme = "light",
      "appearance/accentColor": accentColor = "teal",
      "behaviour/showOnStart": showOnStart,
    },
    setSettings,
  ] = useSettings();
  const [tab, setTab] = useState("general");
  function renderHeading(label: ReactNode) {
    return (
      <Type component="div" variant="overline" color="text.secondary">
        {label}
      </Type>
    );
  }
  function renderLabel(label: ReactNode) {
    return (
      <Type
        component="div"
        variant="body1"
        sx={{
          mr: 4,
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </Type>
    );
  }
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
              mx: isViewTree ? 0 : -1,
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
          <Block vertical>
            <Scroll y>
              <Block vertical pt={6}>
                <TabPanel value="general" sx={{ p: 2 }}>
                  <Box>
                    {renderHeading("Playback")}
                    <Block alignItems="center" justifyContent="space-between">
                      {renderLabel("Playback rate")}
                      <Slider
                        sx={{ maxWidth: 320, mr: 2 }}
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
                          setSettings(() => ({
                            "playback/playbackRate": v as number,
                          }))
                        }
                      />
                    </Block>
                    {renderHeading("Appearance")}
                    <Block alignItems="center" justifyContent="space-between">
                      {renderLabel("Acrylic")}
                      <Switch
                        defaultChecked={!!acrylic}
                        onChange={(_, v) =>
                          setSettings(() => ({ "appearance/acrylic": v }))
                        }
                      />
                    </Block>
                    <Block alignItems="center" justifyContent="space-between">
                      {renderLabel("Dark mode")}
                      <Space flex={1} />
                      <Switch
                        defaultChecked={theme === "dark"}
                        onChange={(_, v) =>
                          setSettings(() => ({
                            "appearance/theme": v ? "dark" : "light",
                          }))
                        }
                      />
                    </Block>
                    <Block alignItems="center" justifyContent="space-between">
                      {renderLabel("Accent")}
                      <Box sx={{ p: 1 }}>
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
                            setSettings(() => ({
                              "appearance/accentColor": v as AccentColor,
                            }))
                          }
                        />
                      </Box>
                    </Block>
                    {renderHeading("Behaviour")}
                    <Block alignItems="center" justifyContent="space-between">
                      {renderLabel("Show explore on start-up")}
                      <Switch
                        defaultChecked={!!showOnStart}
                        onChange={(_, v) =>
                          setSettings(() => ({
                            "behaviour/showOnStart": v ? "explore" : undefined,
                          }))
                        }
                      />
                    </Block>
                    {renderHeading("Advanced")}
                    <Block alignItems="center" justifyContent="space-between">
                      {renderLabel("Reset settings and extensions")}
                      <Surface
                        trigger={({ open }) => (
                          <Button
                            size="small"
                            sx={{ mx: 1 }}
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
                                    setSettings(() => defaults);
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
                    </Block>
                  </Box>
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
                      Rendering traces in the viewport and using advanced
                      debugger features sometimes requires running third-party
                      code.
                    </Typography>
                    <Typography
                      component="div"
                      color="text.secondary"
                      variant="caption"
                      sx={{ pt: 2 }}
                    >
                      You&apos;ll be prompted to add origins when necessary, and
                      you can stop trusting origins by removing them from this
                      list.
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
              </Block>
            </Scroll>
          </Block>
        </Page.Content>
        <Page.Extras>{controls}</Page.Extras>
      </Page>
    </TabContext>
  );
}

const a = keys(mapParsers).map((c) => ({ key: c }));
type A = (typeof a)[number];

export function useSetting<TPath extends $<Objects.AllPaths, Settings>>(
  key: TPath,
  def: Exclude<Get<Settings, TPath>, undefined | void>
) {
  const [settings, setSettings] = useSettings();
  return useOptimisticTransaction(
    get(settings, key)! ?? def,
    (f: Transaction<Exclude<Get<Settings, TPath>, undefined | void>>) =>
      idle(() =>
        setSettings((prev) => ({
          [key]: produce(get(prev, key) ?? def, f),
        }))
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
        // onChange={debounce((v) => setSettings(() => ({ remote: v })), 300)}
        create={() => ({
          key: "",
        })}
      />
    </Box>
  );
}
