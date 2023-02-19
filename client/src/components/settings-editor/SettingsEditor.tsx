import {
  Box,
  Divider,
  FormControl,
  MenuItem,
  Select,
  Slider,
  Switch,
  Tab,
  Typography as Type,
} from "@material-ui/core";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import { Flex } from "components/generic/Flex";
import { Space } from "components/generic/Space";
import { ReactNode, useCallback, useState, useMemo } from "react";
import { defaultPlaybackRate as baseRate, useSettings } from "slices/settings";
import { ServerListEditor } from "./ServerListEditor";

const formatLabel = (v: number) => `${v}x`;

export function SettingsEditor() {
  const [settings, setSettings] = useSettings();
  const { playbackRate = 1, acrylic, dark, followSystemDark } = settings;
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

  const themeName = useMemo(() => {
    const name = followSystemDark?"Follow System":(dark?"Dark":"Light");
    console.log(name);
    
    return name;
  }, [dark, followSystemDark])

  const handleTheme = useCallback(e => {
    switch(e.target.value) {
      case "Follow System":
        setSettings({ ...settings, followSystemDark: true }); break;
      case "Dark": 
        setSettings({ ...settings, followSystemDark: false, dark: true }); break;
      case "Light":
        setSettings({ ...settings, followSystemDark: false, dark: false }); break;
    }
  }, [setSettings])
  return (
    <TabContext value={tab}>
      <TabList onChange={(_, v) => setTab(v)}>
        <Tab label="General" value="general" />
        <Tab label="Connections" value="connections" />
      </TabList>
      <Divider />
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
                setSettings({...settings, playbackRate: v as number })
              }
            />
          </Flex>
          {renderHeading("UI")}
          <Flex alignItems="center">
            {renderLabel("Use Acrylic (Impacts Performance)")}
            <Space flex={1} />
            <Switch
              defaultChecked={!!acrylic}
              onChange={(_, v) => setSettings({ ...settings, acrylic: v })}
            />
          </Flex>
          <Flex alignItems="center">
            {renderLabel("Theme")}
            <Space flex={1} />
            <FormControl sx={{minWidth:120, my:2}} size="small">
              <Select
                id="theme-select"
                value={themeName}
                onChange={handleTheme}
              >
                <MenuItem value="Dark">Dark</MenuItem>
                <MenuItem value="Light">Light</MenuItem>
                <MenuItem value="Follow System">Follow System</MenuItem>
              </Select>
            </FormControl>
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
