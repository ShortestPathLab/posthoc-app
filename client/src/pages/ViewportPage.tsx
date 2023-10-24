import {
  BlurCircularOutlined,
  CenterFocusStrongOutlined,
  CropFreeOutlined,
  LayersOutlined,
} from "@mui/icons-material";
import { Box, Divider, Stack } from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { FeaturePickerButton } from "components/app-bar/FeaturePickerButton";
import { FeaturePickerMulti } from "components/app-bar/FeaturePickerMulti";
import { Flex } from "components/generic/Flex";
import { TraceRenderer } from "components/inspector/TraceRenderer";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { inferLayerName } from "components/layer-editor/layers/LayerSource";
import { Dictionary, every, filter, find, head, keyBy, map } from "lodash";
import { Page } from "pages/Page";
import { useMemo, useState } from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { Renderer as RendererInstance } from "renderer";
import { useLayers } from "slices/layers";
import { Renderer, useRenderers } from "slices/renderers";
import { PanelState } from "slices/view";

const divider = <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;

type ViewportPageContext = PanelState & {
  renderer?: string;
};

export function autoSelectRenderer(
  renderers: Renderer[],
  //TODO:
  components: string[]
) {
  return find(renderers, (r) => {
    const components = keyBy(r.renderer.meta.components);
    return every(components, (n) => n in components);
  });
}

export function ViewportPage() {
  const { controls, onChange, state } =
    useViewTreeContext<ViewportPageContext>();
  const [renderers] = useRenderers();

  const [{ layers: layers }] = useLayers();
  const [layerSet, setLayerSet] = useState<Dictionary<boolean | undefined>>({});
  const selectedLayers = useMemo(
    () => filter(layers, (l) => layerSet?.[l.key] ?? true),
    [layerSet, layers]
  );

  const [rendererInstance, setRendererInstance] =
    useState<RendererInstance | null>();

  const autoRenderer = useMemo(() => head(renderers), [renderers]);

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
            icon={<BlurCircularOutlined />}
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
            label="Layers"
            icon={<LayersOutlined />}
            value={layerSet}
            onChange={setLayerSet}
            items={map(layers, (c) => ({
              id: c.key,
              name: inferLayerName(c),
            }))}
            showArrow
          />
          {divider}
          <FeaturePickerButton
            disabled={!rendererInstance}
            onClick={() => {
              rendererInstance?.fitCamera();
            }}
            icon={<CenterFocusStrongOutlined />}
          >
            Fit
          </FeaturePickerButton>
          <FeaturePickerButton
            disabled={!rendererInstance}
            onClick={() => {
              rendererInstance?.initialCamera();
            }}
            icon={<CropFreeOutlined />}
          >
            1:1
          </FeaturePickerButton>
        </Stack>
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
