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
import { every, find, keyBy, map } from "lodash";
import { useMemo } from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { PanelState } from "slices/UIState";
import { Renderer, useRenderers } from "slices/renderers";

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
                <TraceRenderer {...size} renderer={selectedRenderer} />
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
          <FeaturePicker
            label="All Layers"
            icon={<LayersTwoTone />}
            value={undefined}
            items={[]}
            showArrow
          />
          {divider}
          <Button disabled startIcon={<CenterFocusStrongTwoTone />}>
            Fit
          </Button>
          <Button disabled startIcon={<CropFreeTwoTone />}>
            1:1
          </Button>
        </Stack>
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
