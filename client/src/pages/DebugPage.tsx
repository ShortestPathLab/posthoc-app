import { BugReportOutlined } from "@mui-symbols-material/w400";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Divider, Tab } from "@mui/material";
import { LayerPicker } from "components/generic/LayerPicker";
import { Scroll } from "components/generic/Scrollbars";
import { Placeholder } from "components/inspector/Placeholder";
import { TrustedContent } from "components/inspector/TrustedContent";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { makeTemplate } from "components/script-editor/makeTemplate";
import { ScriptEditor } from "components/script-editor/ScriptEditor";
import { templates } from "components/script-editor/templates";
import { DebugLayerData } from "hooks/useBreakpointsOld";
import { getController } from "layers/layerControllers";
import { set, values } from "lodash";
import { useState } from "react";
import { slice } from "slices";
import { Layer, useLayerPicker } from "slices/layers";
import { BreakpointListEditor } from "../components/breakpoint-editor/BreakpointListEditor";
import { PageContentProps } from "./PageMeta";

const stepsLayerGuard = (l: Layer<unknown>): l is Layer<DebugLayerData> =>
  !!getController(l).steps;

const divider = (
  <Divider
    orientation="vertical"
    flexItem
    sx={{ m: 1, height: (t) => t.spacing(3), alignSelf: "auto" }}
  />
);

function useDebugPageState(key?: string) {
  const layer = slice.layers.one<Layer<DebugLayerData>>(key).use();
  return { layer };
}

export function DebugPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle, isViewTree } =
    useViewTreeContext();

  const [tab, setTab] = useState("standard");

  const { key, setKey } = useLayerPicker(stepsLayerGuard);

  const one = slice.layers.one<Layer<DebugLayerData>>(key);
  const { layer } = useDebugPageState(key);
  const { code } = layer?.source ?? {};

  return (
    <TabContext value={tab}>
      <Page onChange={onChange} stack={state}>
        <Page.Key>debug</Page.Key>
        <Page.Title>Debugger</Page.Title>
        <Page.Handle>{dragHandle}</Page.Handle>
        <Page.Options>
          <LayerPicker guard={stepsLayerGuard} onChange={setKey} value={key} />
          {divider}
          <TabList
            onChange={(_, v) => setTab(v)}
            sx={{
              mx: isViewTree ? 0 : -1,
              "& button": { minWidth: 0 },
            }}
          >
            <Tab label="Standard" value="standard" disabled={!layer} />
            <Tab label="Advanced" value="advanced" disabled={!layer} />
          </TabList>
        </Page.Options>
        <Page.Content>
          {layer ? (
            <Scroll y>
              <Box pt={6} height="100%">
                <TabPanel value="standard" sx={{ p: 2 }}>
                  <Box mx={-2}>
                    <BreakpointListEditor layer={layer?.key} />
                  </Box>
                </TabPanel>
                <TabPanel value="advanced" sx={{ p: 0, height: "100%" }}>
                  <TrustedContent>
                    <ScriptEditor
                      code={code ?? makeTemplate(values(templates))}
                      onChange={(v) =>
                        layer && one.set((l) => set(l, "source.code", v))
                      }
                    />
                  </TrustedContent>
                </TabPanel>
              </Box>
            </Scroll>
          ) : (
            <Placeholder
              icon={<BugReportOutlined />}
              label="Debugger"
              secondary="Configure breakpoints and other debugging options here. First, you'll need to load a trace."
            />
          )}
        </Page.Content>
        <Page.Extras>{controls}</Page.Extras>
      </Page>
    </TabContext>
  );
}
