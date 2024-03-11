import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Slider,
  Switch,
  Tab,
  Typography as Type,
} from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import { Space } from "components/generic/Space";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { mapParsers } from "components/renderer/map-parser";
import { RendererListEditor } from "components/settings-editor/RendererListEditor";
import { ServerListEditor } from "components/settings-editor/ServerListEditor";
import { keys, map, sortBy, startCase } from "lodash";
import { ReactNode, useState } from "react";
import { defaultPlaybackRate as baseRate, useSettings } from "slices/settings";
import { AccentColor, accentColors, getShade } from "theme";
import { AboutContent } from "./AboutPage";
import { PageContentProps } from "./PageMeta";
import { ColorTranslator } from "colortranslator";
const formatLabel = (v: number) => `${v}x`;

export function SettingsPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle } = useViewTreeContext();

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
            <Tab label="Connections" value="connections" />
            <Tab label="Renderers" value="renderers" />
            <Tab label="Map Parsers" value="map-parsers" />
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
                      {renderLabel("Playback Rate")}
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
                      {renderLabel("Dark Mode")}
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
                      {renderLabel("Show Explore Panel on Start-up")}
                      <Switch
                        defaultChecked={!!showOnStart}
                        onChange={(_, v) =>
                          setSettings(() => ({
                            "behaviour/showOnStart": v ? "explore" : undefined,
                          }))
                        }
                      />
                    </Flex>
                  </Box>
                </TabPanel>
                <TabPanel value="connections" sx={{ p: 2 }}>
                  <Box>
                    {renderHeading("Solvers")}
                    <ServerListEditor />
                  </Box>
                </TabPanel>
                <TabPanel value="renderers" sx={{ p: 2 }}>
                  <Box>
                    {renderHeading("Renderers")}
                    <RendererListEditor />
                  </Box>
                </TabPanel>
                <TabPanel value="map-parsers" sx={{ p: 2 }}>
                  <Box>
                    {renderHeading("Map Parsers")}
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

export function MapParserListEditor() {
  return (
    <List>
      {keys(mapParsers).map((c) => (
        <ListItem key={c}>
          <ListItemText primary={c} secondary={"Internal"} />
        </ListItem>
      ))}
    </List>
  );
}
