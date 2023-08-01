import {
  BlurCircularTwoTone,
  CenterFocusStrongTwoTone,
  CropFreeTwoTone,
  LayersTwoTone,
} from "@mui/icons-material";
import { Box, Button, Divider, Stack } from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Flex } from "components/generic/Flex";
import { TraceRenderer } from "components/inspector/TraceRenderer";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { Page } from "pages/Page";
import { useParsedMap } from "hooks/useParsedMap";
import { Dictionary, every, filter, find, keyBy, map } from "lodash";
import { useMemo, useState } from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { PanelState, useUIState } from "slices/UIState";
import { Renderer, useRenderers } from "slices/renderers";
import { Renderer as RendererInstance } from "renderer";
import { FeaturePickerMulti } from "components/app-bar/FeaturePickerMulti";

const divider = <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;

type ViewportPageContext = PanelState & {
  renderer?: string;
};

function autoSelectRenderer(renderers: Renderer[], components: string[]) {
  return find(renderers, (r) => {
    const components = keyBy(r.renderer.meta.components);
    return every(components, (n) => n in components);
  });
}

export function ViewportPage() {
  const { controls, onChange, state } =
    useViewTreeContext<ViewportPageContext>();
  const [renderers] = useRenderers();

  const [{ layers }] = useUIState();
  const [layerSet, setLayerSet] = useState<Dictionary<boolean | undefined>>({});
  const selectedLayers = useMemo(
    () => filter(layers, (l) => layerSet?.[l.key] ?? true),
    [layerSet, layers]
  );

  const [rendererInstance, setRendererInstance] =
    useState<RendererInstance | null>();

  const { result: m } = useParsedMap();

  const autoRenderer = useMemo(
    () => autoSelectRenderer(renderers, map(m?.nodes, "$")),
    [renderers, m]
  );

  const selectedRenderer =
    state?.renderer && state.renderer !== "internal:auto"
      ? state.renderer
      : autoRenderer?.renderer?.meta?.id;

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Content>
        <Flex>
          <AutoSize>
            {(size) => (
              <Box>
                <TraceRenderer
                  {...size}
                  layers={selectedLayers}
                  renderer={selectedRenderer}
                  rendererRef={setRendererInstance}
                />
              </Box>
            )}
          </AutoSize>
        </Flex>
      </Page.Content>
      <Page.Options>
        <Stack direction="row">
          <FeaturePicker
            label="Renderer"
            icon={<BlurCircularTwoTone />}
            value={state?.renderer ?? "internal:auto"}
            onChange={(v) => onChange?.({ renderer: v })}
            items={[
              {
                id: "internal:auto",
                name: `Auto (${autoRenderer?.renderer?.meta?.name ?? "None"})`,
              },
              ...map(renderers, ({ renderer }) => ({
                id: renderer.meta.id,
                name: renderer.meta.name,
                description: renderer.meta.id,
              })),
            ]}
            showArrow
          />
          {divider}
          <FeaturePickerMulti
            defaultChecked
            label="All Layers"
            icon={<LayersTwoTone />}
            value={layerSet}
            onChange={setLayerSet}
            items={map(layers, (c) => ({
              id: c.key,
              name: c.name ?? "Untitled Layer",
            }))}
            showArrow
          />
          {divider}
          <Button
            disabled={!rendererInstance}
            onClick={() => {
              rendererInstance?.fitCamera();
            }}
            startIcon={<CenterFocusStrongTwoTone />}
          >
            Fit
          </Button>
          <Button
            disabled={!rendererInstance}
            onClick={() => {
              rendererInstance?.initialCamera();
            }}
            startIcon={<CropFreeTwoTone />}
          >
            1:1
          </Button>
        </Stack>
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
