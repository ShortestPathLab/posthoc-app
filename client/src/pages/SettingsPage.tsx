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
import { keys, map, startCase } from "lodash";
import { ReactNode, useState } from "react";
import { defaultPlaybackRate as baseRate, useSettings } from "slices/settings";
import { AccentColor, accentColors } from "theme";
import { PageContentProps } from "./PageMeta";
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
      <Type variant="body1" sx={{ minWidth: "max-content", mr: 4 }}>
        {label}
      </Type>
    );
  }
  return (
    <TabContext value={tab}>
      <Page onChange={onChange} stack={state}>
        <Page.Handle>{dragHandle}</Page.Handle>
        <Page.Options>
          <TabList onChange={(_, v) => setTab(v)}>
            <Tab label="General" value="general" />
            <Tab label="Connections" value="connections" />
            <Tab label="Renderers" value="renderers" />
            <Tab label="Map Parsers" value="map-parsers" />
          </TabList>
        </Page.Options>
        <Page.Content>
          <Flex vertical>
            <Scroll y>
              <Flex vertical pt={6}>
                <TabPanel value="general">
                  <Box>
                    {renderHeading("Playback")}
                    <Flex alignItems="center">
                      {renderLabel("Playback Rate")}
                      <Space flex={1} />
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
                    <Flex alignItems="center">
                      {renderLabel("Acrylic")}
                      <Space flex={1} />
                      <Switch
                        defaultChecked={!!acrylic}
                        onChange={(_, v) =>
                          setSettings(() => ({ "appearance/acrylic": v }))
                        }
                      />
                    </Flex>
                    <Flex alignItems="center">
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
                    <Flex alignItems="center">
                      {renderLabel("Accent")}
                      <Space flex={1} />
                      <FeaturePicker
                        value={accentColor}
                        items={map(keys(accentColors), (c) => ({
                          id: c,
                          name: startCase(c),
                        }))}
                        arrow
                        onChange={(v) =>
                          setSettings(() => ({
                            "appearance/accentColor": v as AccentColor,
                          }))
                        }
                      />
                    </Flex>
                    {renderHeading("Behaviour")}
                    <Flex alignItems="center">
                      {renderLabel("Show Explore Panel on Start-up")}
                      <Space flex={1} />
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
                <TabPanel value="connections">
                  <Box>
                    {renderHeading("Solvers")}
                    <ServerListEditor />
                  </Box>
                </TabPanel>
                <TabPanel value="renderers">
                  <Box>
                    {renderHeading("Renderers")}
                    <RendererListEditor />
                  </Box>
                </TabPanel>
                <TabPanel value="map-parsers">
                  <Box>
                    {renderHeading("Map Parsers")}
                    <MapParserListEditor />
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
