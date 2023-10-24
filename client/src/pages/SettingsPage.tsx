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
import { keys, map, startCase } from "lodash";
import { ReactNode, useState } from "react";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Flex } from "components/generic/Flex";
import { Scroll } from "components/generic/Scrollbars";
import { Space } from "components/generic/Space";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { mapParsers } from "components/renderer/map-parser";
import { RendererListEditor } from "components/settings-editor/RendererListEditor";
import { ServerListEditor } from "components/settings-editor/ServerListEditor";
import { Page } from "pages/Page";
import { defaultPlaybackRate as baseRate, useSettings } from "slices/settings";
import { AccentColor, accentColors } from "theme";

const formatLabel = (v: number) => `${v}x`;

export function SettingsPage() {
  const { controls, onChange, state } = useViewTreeContext();
  const [
    { playbackRate = 1, acrylic, theme = "light", accentColor = "teal" },
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
    return <Type variant="body1">{label}</Type>;
  }
  return (
    <TabContext value={tab}>
      <Page onChange={onChange} stack={state}>
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
                        marks={[0.25, 1, 5].map((v) => ({
                          value: v * baseRate,
                          label: formatLabel(v),
                        }))}
                        step={0.25 * baseRate}
                        min={0.25 * baseRate}
                        max={5 * baseRate}
                        valueLabelFormat={(v) => formatLabel(v / baseRate)}
                        valueLabelDisplay="auto"
                        defaultValue={playbackRate}
                        onChangeCommitted={(_, v) =>
                          setSettings(() => ({ playbackRate: v as number }))
                        }
                      />
                    </Flex>
                    {renderHeading("UI")}
                    <Flex alignItems="center">
                      {renderLabel("Acrylic")}
                      <Space flex={1} />
                      <Switch
                        defaultChecked={!!acrylic}
                        onChange={(_, v) => setSettings(() => ({ acrylic: v }))}
                      />
                    </Flex>
                    <Flex alignItems="center">
                      {renderLabel("Dark Mode")}
                      <Space flex={1} />
                      <Switch
                        defaultChecked={theme === "dark"}
                        onChange={(_, v) =>
                          setSettings(() => ({ theme: v ? "dark" : "light" }))
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
                        showArrow
                        onChange={(v) =>
                          setSettings(() => ({ accentColor: v as AccentColor }))
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
