import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Slider,
  Switch,
  Tab,
  Typography as Type,
  colors,
} from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Flex } from "components/generic/Flex";
import { Space } from "components/generic/Space";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { Page } from "pages/Page";
import { RendererListEditor } from "components/settings-editor/RendererListEditor";
import { ServerListEditor } from "components/settings-editor/ServerListEditor";
import { keys, map, startCase } from "lodash";
import { ReactNode, useState } from "react";
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
      <Type variant="overline" color="textSecondary">
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
          </TabList>
        </Page.Options>
        <Page.Content>
          <Box height="100%" overflow="auto">
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
                        setSettings({ playbackRate: v as number })
                      }
                    />
                  </Flex>
                  {renderHeading("UI")}
                  <Flex alignItems="center">
                    {renderLabel("Acrylic")}
                    <Space flex={1} />
                    <Switch
                      defaultChecked={!!acrylic}
                      onChange={(_, v) => setSettings({ acrylic: v })}
                    />
                  </Flex>
                  <Flex alignItems="center">
                    {renderLabel("Dark Mode")}
                    <Space flex={1} />
                    <Switch
                      defaultChecked={theme === "dark"}
                      onChange={(_, v) =>
                        setSettings({ theme: v ? "dark" : "light" })
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
                        setSettings({ accentColor: v as AccentColor })
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
            </Flex>
          </Box>
        </Page.Content>
        <Page.Extras>{controls}</Page.Extras>
      </Page>
    </TabContext>
  );
}
