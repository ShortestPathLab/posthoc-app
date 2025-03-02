import {
  CameraOutlined,
  CenterFocusWeakOutlined,
  TimesOneMobiledataOutlined,
} from "@mui-symbols-material/w300";
import {
  BlurCircularOutlined,
  LayersOutlined,
} from "@mui-symbols-material/w400";
import { Box, Divider, Stack, SxProps, Theme } from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { FeaturePickerMulti } from "components/app-bar/FeaturePickerMulti";
import { Block } from "components/generic/Block";
import { IconButtonWithTooltip } from "components/generic/inputs/IconButtonWithTooltip";
import { useSurfaceAvailableCssSize } from "components/generic/surface/useSurfaceSize";
import { TraceRenderer } from "components/inspector/TraceRenderer";
import { useViewTreeContext } from "components/inspector/ViewTree";
import download from "downloadjs";
import { inferLayerName } from "layers/inferLayerName";
import {
  Dictionary,
  chain as _,
  delay,
  every,
  filter,
  find,
  keyBy,
  map,
} from "lodash";
import { useEffect, useMemo, useState } from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { Renderer as RendererInstance } from "renderer";
import { slice } from "slices";
import { Renderer, useRenderers } from "slices/renderers";
import { PanelState } from "slices/view";
import { useAcrylic, usePaper } from "theme";
import { generateUsername as id } from "unique-username-generator";
import { PageContentProps } from "./PageMeta";
import { useRendererResolver } from "./useRendererResolver";

const divider = <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;

type ViewportPageContext = PanelState & {
  renderer?: string;
};

export function autoSelectRenderer(
  renderers: Renderer[],
  //TODO:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  components: string[]
) {
  return find(renderers, (r) => {
    const components = keyBy(r.renderer.meta.components);
    return every(components, (n) => n in components);
  });
}

export function ViewportPage({ template: Page }: PageContentProps) {
  "use no memo";
  const { controls, onChange, state, dragHandle } =
    useViewTreeContext<ViewportPageContext>();
  const [renderers] = useRenderers();
  const paper = usePaper();
  const acrylic = useAcrylic();
  const layers = slice.layers.use();
  const [layerSet, setLayerSet] = useState<Dictionary<boolean | undefined>>({});
  const selectedLayers = useMemo(
    () => filter(layers, (l) => layerSet?.[l.key] ?? true),
    [layerSet, layers, layers?.length]
  );

  const [rendererInstance, setRendererInstance] =
    useState<RendererInstance | null>();

  const { selected, auto } = useRendererResolver(state?.renderer);

  useEffect(() => {
    delay(() => {
      rendererInstance?.fitCamera?.((b) =>
        _(selectedLayers)
          .filter("viewKey")
          .map("key")
          .includes(b.meta?.sourceLayer ?? "")
          .value()
      );
    }, 150);
  }, [
    rendererInstance,
    _(selectedLayers).map("viewKey").sort().join(".").value(),
  ]);

  const size = useSurfaceAvailableCssSize();

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>viewport</Page.Key>
      <Page.Title>Viewport</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Block sx={size}>
          <AutoSize>
            {(size) => (
              <Box>
                <TraceRenderer
                  {...size}
                  layers={selectedLayers}
                  renderer={selected}
                  rendererRef={setRendererInstance}
                />
                <Stack sx={{ pt: 6, position: "absolute", top: 0, left: 0 }}>
                  <Stack
                    direction="row"
                    sx={
                      {
                        ...paper(1),
                        ...acrylic,
                        alignItems: "center",
                        height: (t) => t.spacing(6),
                        px: 1,
                        m: 1,
                      } as SxProps<Theme>
                    }
                  >
                    <IconButtonWithTooltip
                      color="primary"
                      disabled={!rendererInstance}
                      onClick={() => {
                        rendererInstance?.fitCamera();
                      }}
                      label="Fit"
                      icon={<CenterFocusWeakOutlined />}
                    />
                    <IconButtonWithTooltip
                      color="primary"
                      disabled={!rendererInstance}
                      onClick={() => {
                        rendererInstance?.initialCamera?.();
                      }}
                      icon={<TimesOneMobiledataOutlined />}
                      label="1 to 1"
                    />
                    {divider}
                    <IconButtonWithTooltip
                      color="primary"
                      disabled={!rendererInstance}
                      onClick={async () => {
                        const a = await rendererInstance?.toDataUrl();
                        if (a) {
                          download(a, id("-"));
                        }
                      }}
                      icon={<CameraOutlined />}
                      label="capture-screenshot"
                    />
                  </Stack>
                </Stack>
              </Box>
            )}
          </AutoSize>
        </Block>
      </Page.Content>
      <Page.Options>
        <Stack direction="row">
          <FeaturePicker
            label="Renderer"
            icon={<BlurCircularOutlined />}
            value={state?.renderer ?? "internal:auto"}
            onChange={(v) => onChange?.((p) => void (p.renderer = v))}
            items={[
              {
                id: "internal:auto",
                name: `Auto (${auto?.renderer?.meta?.name ?? "None"})`,
              },
              ...map(
                filter(renderers, (r) => !!r.renderer),
                ({ renderer }) => ({
                  id: renderer?.meta?.id,
                  name: renderer?.meta?.name,
                  description: renderer?.meta?.id,
                })
              ),
            ]}
            arrow
          />
          {divider}
          <FeaturePickerMulti
            defaultChecked
            label="Layers"
            icon={<LayersOutlined />}
            value={layerSet}
            onChange={setLayerSet}
            items={map(layers, (c) => ({
              id: c?.key,
              name: inferLayerName(c),
            }))}
            showArrow
            ellipsis={12}
          />
        </Stack>
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
