import {
  Box,
  Divider,
  Slider,
  Tab,
  Typography as Type,
} from "@material-ui/core";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import { Flex } from "components/generic/Flex";
import { Space } from "components/generic/Space";
import { ReactNode, useState } from "react";
import { useSettings } from "slices/settings";
import { ServerListEditor } from "./ServerListEditor";

export const defaultPlaybackRate = 4;

const formatLabel = (v: number) => `${v}x`;

export function SettingsEditor() {
  const [{ playbackRate = 1 }, setSettings] = useSettings();
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
      <TabList onChange={(_, v) => setTab(v)}>
        <Tab label="General" value="general" />
        <Tab label="Connections" value="connections" />
      </TabList>
      <Divider />
      <TabPanel value="general">
        <Box>
          {renderHeading("Visualiser")}
          <Flex alignItems="center">
            {renderLabel("Playback Rate")}
            <Space flex={1} />
            <Slider
              sx={{ maxWidth: 320 }}
              marks={[0.25, 1, 5].map((v) => ({
                value: v * defaultPlaybackRate,
                label: formatLabel(v),
              }))}
              step={0.25 * defaultPlaybackRate}
              min={0.25 * defaultPlaybackRate}
              max={5 * defaultPlaybackRate}
              valueLabelFormat={(v) => formatLabel(v / defaultPlaybackRate)}
              valueLabelDisplay="auto"
              defaultValue={playbackRate}
              onChangeCommitted={(_, v) =>
                setSettings({ playbackRate: v as number })
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
    </TabContext>
  );
}
