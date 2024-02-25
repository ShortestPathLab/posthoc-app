import { LayersOutlined as LayersIcon } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Divider, Tab, Typography as Type } from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { ScriptEditor } from "components/script-editor/ScriptEditor";
import { makeTemplate } from "components/script-editor/makeTemplate";
import { templates } from "components/script-editor/templates";
import { DebugLayerData } from "hooks/useBreakpoints";
import { inferLayerName } from "layers/inferLayerName";
import { map, set, values } from "lodash";
import { produce } from "produce";
import { ReactNode, useState } from "react";
import { useLayer } from "slices/layers";
import { BreakpointListEditor } from "../components/breakpoint-editor/BreakpointListEditor";
import { PageContentProps } from "./PageMeta";

const divider = (
  <Divider
    orientation="vertical"
    flexItem
    sx={{ m: 1, height: (t) => t.spacing(3), alignSelf: "auto" }}
  />
);

export function DebugPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle } = useViewTreeContext();

  const [tab, setTab] = useState("standard");
  const { key, setKey, layers, layer, setLayer } = useLayer<DebugLayerData>();
  const { code } = layer?.source ?? {};
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
        <Page.Handle>{dragHandle}</Page.Handle>
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
            arrow
            ellipsis={12}
          />
          {divider}
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
                  {renderHeading("Breakpoints")}
                  <BreakpointListEditor layer={layer?.key} />
                </Box>
              </TabPanel>
              <TabPanel value="advanced" sx={{ p: 0, height: "100%" }}>
                <ScriptEditor
                  code={code ?? makeTemplate(values(templates))}
                  onChange={(v) =>
                    layer &&
                    setLayer(
                      produce(layer, (layer) => set(layer, "source.code", v))
                    )
                  }
                />
              </TabPanel>
            </Box>
          </Box>
        </Page.Content>
        <Page.Extras>{controls}</Page.Extras>
      </Page>
    </TabContext>
  );
}
