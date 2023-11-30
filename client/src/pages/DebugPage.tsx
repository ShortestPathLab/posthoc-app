import {
  LayersOutlined as LayersIcon
} from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab, Typography as Type } from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Flex } from "components/generic/Flex";
import { Space } from "components/generic/Space";
import { Switch } from "components/generic/Switch";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { ScriptEditor } from "components/script-editor/ScriptEditor";
import { DebugLayerData } from "hooks/useBreakpoints";
import { inferLayerName } from "layers/Layer";
import { map, set } from "lodash";
import { Page } from "pages/Page";
import { produce } from "produce";
import { ReactNode, useState } from "react";
import { useLayer } from "slices/layers";
import { BreakpointListEditor } from "../components/breakpoint-editor/BreakpointListEditor";

export function DebugPage() {
  const { controls, onChange, state } = useViewTreeContext();
  const [tab, setTab] = useState("standard");
  const { key, setKey, layers, layer ,setLayer} = useLayer<DebugLayerData>();
  const {monotonicF,monotonicG,breakpoints} = layer?.source??{}
  function renderHeading(label: ReactNode) {
    return (
      <Type variant="overline" color="text.secondary">
        {label}
      </Type>
    );
  }
  return (
    <TabContext value={tab}>
      <Page onChange={onChange} stack={state}>
        <Page.Options>
        <FeaturePicker
          icon={<LayersIcon />}
          label="Layer"
          value={key}
          items={map(layers, (l) => ({
            id: l.key,
            name: inferLayerName(l),
          }))}
          onChange={setKey}
          showArrow
        />
          <TabList onChange={(_, v) => setTab(v)}>
            <Tab label="Standard" value="standard" />
            <Tab label="Advanced" value="advanced" />
          </TabList>
        </Page.Options>
        <Page.Content>
          <Box overflow="auto" height="100%">
            <Box pt={6} height="100%">
              <TabPanel value="standard">
                <Box>
                  {renderHeading("General")}
                  <Flex>
                    <Switch
                      label="Monotonic f value"
                      checked={!!monotonicF}
                      disabled = {!layer}
                      onChange={(_, v) => layer && setLayer(produce(layer, (layer) => set(layer, 'source.monotonicF',v)))}
                    />
                    <Space />
                    <Switch
                      label="Monotonic g value"
                      checked={!!monotonicG}
                      disabled = {!layer}
                      onChange={(_, v) => layer && setLayer(produce(layer, (layer) => set(layer, 'source.monotonicG',v)))}
                    />
                  </Flex>
                </Box>
                <Space />
                <Box>
                  {renderHeading("Breakpoints")}
                  <BreakpointListEditor breakpoints={breakpoints} layer={layer}/>
                </Box>
                <Box>
                  {renderHeading("Export")}
                  <Flex mt={1}>
                    {/* <Button
                      variant="contained"
                      disableElevation
                      disabled={!specimen}
                      onClick={() => save(`${algorithm}.${format}`, specimen)}
                    >
                      Save Trace as JSON
                    </Button> */}
                  </Flex>
                </Box>
              </TabPanel>
              <TabPanel value="advanced" sx={{ p: 0, height: "100%" }}>
                <ScriptEditor />
              </TabPanel>
            </Box>
          </Box>{" "}
        </Page.Content>
        <Page.Extras>{controls}</Page.Extras>
      </Page>
    </TabContext>
  );
}
