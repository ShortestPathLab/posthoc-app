import { Box, Divider, Tab, Typography as Type } from "@material-ui/core";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import { Flex } from "components/generic/Flex";
import { Space } from "components/generic/Space";
import { Switch } from "components/generic/Switch";
import { ReactNode, useState } from "react";
import { useUIState } from "slices/UIState";
import { BreakpointListEditor } from "./breakpoint-editor/BreakpointListEditor";
import { ScriptEditor } from "./script-editor/ScriptEditor";

export function DebugOptionsEditor() {
  const [{ monotonicF, monotonicG }, setUIState] = useUIState();
  const [tab, setTab] = useState("standard");
  function renderHeading(label: ReactNode) {
    return (
      <Type variant="overline" color="textSecondary">
        {label}
      </Type>
    );
  }
  return (
    <TabContext value={tab}>
      <TabList onChange={(_, v) => setTab(v)}>
        <Tab label="Standard" value="standard" />
        <Tab label="Advanced" value="advanced" />
      </TabList>
      <Divider />
      <TabPanel value="standard">
        <Box>
          {renderHeading("General")}
          <Flex>
            <Switch
              label="Monotonic f value"
              checked={monotonicF}
              onChange={(_, v) => setUIState({ monotonicF: v })}
            />
            <Space />
            <Switch
              label="Monotonic g value"
              checked={monotonicG}
              onChange={(_, v) => setUIState({ monotonicG: v })}
            />
          </Flex>
        </Box>
        <Space />
        <Box>
          {renderHeading("Breakpoints")}
          <BreakpointListEditor />
        </Box>
      </TabPanel>
      <TabPanel value="advanced" sx={{ p: 0 }}>
        <ScriptEditor />
      </TabPanel>
    </TabContext>
  );
}
