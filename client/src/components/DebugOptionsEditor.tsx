import { Divider, Tab } from "@material-ui/core";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import { times } from "lodash";
import { useState } from "react";
import { ScriptEditor } from "./script-editor/ScriptEditor";

export function DebugOptionsEditor() {
  const [tab, setTab] = useState("standard");
  return (
    <TabContext value={tab}>
      <TabList onChange={(_, v) => setTab(v)}>
        <Tab label="Standard" value="standard" />
        <Tab label="Advanced" value="advanced" />
      </TabList>
      <Divider />
      <TabPanel value="standard">
        {times(10, (i) => (
          <div key={i}>Placeholder</div>
        ))}
      </TabPanel>
      <TabPanel value="advanced" sx={{ p: 0 }}>
        <ScriptEditor />
      </TabPanel>
    </TabContext>
  );
}
