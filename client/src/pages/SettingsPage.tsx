import { RestartAltOutlined } from "@mui/icons-material";
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
import { ColorTranslator } from "colortranslator";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Button } from "components/generic/Button";
import { Flex } from "components/generic/Flex";
import { ListEditor } from "components/generic/ListEditor";
import { AppBarTitle, ManagedModal } from "components/generic/Modal";
import { Scroll } from "components/generic/Scrollbars";
import { Space } from "components/generic/Space";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { mapParsers } from "components/renderer/map-parser";
import { RendererListEditor } from "components/settings-editor/RendererListEditor";
import { ServerListEditor } from "components/settings-editor/ServerListEditor";
import { keys, map, sortBy, startCase } from "lodash";
import { ReactNode, useState } from "react";
import { useBusyState } from "slices/busy";
import {
  defaultPlaybackRate as baseRate,
  defaults,
  useSettings,
} from "slices/settings";
import { AccentColor, accentColors, getShade } from "theme";
import { wait } from "utils/timed";
import { AboutContent } from "./AboutPage";
import { PageContentProps } from "./PageMeta";
import { useSmallDisplay } from "hooks/useSmallDisplay";
const formatLabel = (v: number) => `${v}x`;

export function SettingsPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle } = useViewTreeContext();
  const sm = useSmallDisplay();
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
      <Type variant="overline" color="text.secondary">
        {label}
      </Type>
    );
  }
  function renderLabel(label: ReactNode) {
    return (
      <Type
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
        <Page.Title>Settings</Page.Title>
        <Page.Handle>{dragHandle}</Page.Handle>
        <Page.Options>
          <TabList onChange={(_, v) => setTab(v)}>
            <Tab label="General" value="general" />
            <Tab label="Extensions" value="connections" />
            <Tab label="About" value="about" />
          </TabList>
        </Page.Options>
        <Page.Content>
          <Flex vertical>
            <Scroll y>
              <Flex vertical pt={6}>
                <TabPanel value="general" sx={{ p: 2 }}>
                  <Box>
                    {renderHeading("Playback")}
                    <Flex alignItems="center" justifyContent="space-between">
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
                    </Flex>
                    {renderHeading("Appearance")}
                    <Flex alignItems="center" justifyContent="space-between">
                      {renderLabel("Acrylic")}
                      <Switch
                        defaultChecked={!!acrylic}
                        onChange={(_, v) =>
                          setSettings(() => ({ "appearance/acrylic": v }))
                        }
                      />
                    </Flex>
                    <Flex alignItems="center" justifyContent="space-between">
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
                    </Flex>
                    <Flex alignItems="center" justifyContent="space-between">
                      {renderLabel("Accent")}
                      <Box sx={{ p: 1 }}>
                        <FeaturePicker
                          paper
                          value={accentColor}
                          items={map(
                            sortBy(
                              keys(accentColors) as AccentColor[],
                              (c) => new ColorTranslator(getShade(c, theme)).H
                            ),
                            (c) => ({
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
                            })
                          )}
                          arrow
                          onChange={(v) =>
                            setSettings(() => ({
                              "appearance/accentColor": v as AccentColor,
                            }))
                          }
                        />
                      </Box>
                    </Flex>
                    {renderHeading("Behaviour")}
                    <Flex alignItems="center" justifyContent="space-between">
                      {renderLabel("Show explore on start-up")}
                      <Switch
                        defaultChecked={!!showOnStart}
                        onChange={(_, v) =>
                          setSettings(() => ({
                            "behaviour/showOnStart": v ? "explore" : undefined,
                          }))
                        }
                      />
                    </Flex>
                    {renderHeading("Advanced")}
                    <Flex alignItems="center" justifyContent="space-between">
                      {renderLabel("Reset settings and extensions")}
                      <ManagedModal
                        trigger={(onClick) => (
                          <Button
                            sx={{ mx: 1 }}
                            color="error"
                            startIcon={<RestartAltOutlined />}
                            {...{ onClick }}
                          >
                            Reset now
                          </Button>
                        )}
                        appBar={{
                          children: (
                            <AppBarTitle>
                              Reset settings and extensions
                            </AppBarTitle>
                          ),
                        }}
                      >
                        {({ close }) => (
                          <Stack sx={{ p: sm ? 2 : 3, pt: 2, gap: 4 }}>
                            <Typography color="text.secondary">
                              If something's not working correctly, you can try
                              to reset all settings and extensions. This cannot
                              be undone.
                            </Typography>
                            <Stack
                              direction="row"
                              justifyContent="flex-end"
                              gap={2}
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
                                    location.reload();
                                    await wait(Number.MAX_SAFE_INTEGER);
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
                      </ManagedModal>
                    </Flex>
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
                <TabPanel value="about" sx={{ p: 2 }}>
                  <Box>
                    <AboutContent />
                  </Box>
                </TabPanel>
              </Flex>
            </Scroll>
          </Flex>
        </Page.Content>
        <Page.Extras>{controls}</Page.Extras>
      </Page>
    </TabContext>
  );
}

const a = keys(mapParsers).map((c) => ({ key: c }));
type A = (typeof a)[number];

export function MapParserListEditor() {
  return (
    <Box sx={{ mx: -2 }}>
      <ListEditor<A>
        button={false}
        sortable
        addable={false}
        deletable={false}
        editor={(v) => (
          <Box key={v.key}>
            <ListItemText
              primary={startCase(v.key)}
              secondary={`Support for *.${v.key} maps`}
            />
          </Box>
        )}
        icon={null}
        value={a}
        // onChange={debounce((v) => setSettings(() => ({ remote: v })), 300)}
        create={() => ({
          key: "",
        })}
      />
    </Box>
    // <List>
    //   {keys(mapParsers).map((c) => (
    //     <ListItem key={c}>
    //       <ListItemText primary={c} secondary={"Internal"} />
    //     </ListItem>
    //   ))}
    // </List>
  );
}
