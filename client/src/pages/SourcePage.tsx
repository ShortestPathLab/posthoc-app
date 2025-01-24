import { Editor } from "@monaco-editor/react";
import { CodeOutlined } from "@mui-symbols-material/w400";
import { CircularProgress, Tab, Tabs, useTheme } from "@mui/material";
import { Flex } from "components/generic/Flex";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { useMonacoTheme } from "components/script-editor/ScriptEditor";
import { LayerSource } from "layers";
import { getController } from "layers/layerControllers";
import { find, first, map } from "lodash";
import AutoSize from "react-virtualized-auto-sizer";
import { Layer, useLayer } from "slices/layers";
import { divider } from "./Page";
import { PageContentProps } from "./PageMeta";
import { useMemo } from "react";
import { produce } from "produce";

type SourceLayer = Layer;

const isSourceLayer = (l: Layer): l is SourceLayer =>
  !!getController(l)?.getSources;

type SourceLayerState = { source?: string; layer?: string };

export function SourcePage({ template: Page }: PageContentProps) {
  const theme = useTheme();
  useMonacoTheme(theme);

  const { layers, setLayer, layer, key } = useLayer(undefined, isSourceLayer);

  const sources = useMemo(
    () =>
      layers?.flatMap?.(
        (l) =>
          getController(l)
            ?.getSources?.(l)
            ?.map?.((c) => ({
              layer: l.key,
              source: c,
            })),
        // why is layer string here?
      ) as { layer: string; source: LayerSource }[],
    [layers],
  );

  const { controls, onChange, state, dragHandle } =
    useViewTreeContext<SourceLayerState>();

  const selected = useMemo(
    () =>
      find(
        sources,
        (c) => c && c.source.id === state?.source && c.layer === state?.layer,
      ) ?? first(sources),
    [sources, state?.source, state?.layer],
  );

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>source</Page.Key>

      <Page.Title>Source</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        {sources?.length ? (
          <Flex pt={6}>
            <AutoSize>
              {(size) => (
                <Editor
                  theme={
                    theme.palette.mode === "dark" ? "posthoc-dark" : "light"
                  }
                  options={{
                    readOnly: false,
                  }}
                  language={selected?.source?.language}
                  loading={<CircularProgress variant="indeterminate" />}
                  {...size}
                  value={selected?.source?.content}
                  onChange={async (value) => {
                    console.log(value);
                    const modifiedLayer = produce(layer, async (layer) => {
                      console.log(getController(layer)?.onEditSource);
                      return await getController(layer)?.onEditSource?.(
                        layer,
                        key,
                        value,
                      );
                    });
                    console.log(modifiedLayer);
                    if (modifiedLayer) setLayer(modifiedLayer);
                  }}
                />
              )}
            </AutoSize>
          </Flex>
        ) : (
          <Placeholder icon={<CodeOutlined />} label="Source" />
        )}
      </Page.Content>
      <Page.Options>
        {!!sources?.length && (
          <>
            <Tabs
              value={`${selected?.source.id}::${selected?.layer}`}
              onChange={(_, v: string) => {
                const [a, b] = v.split("::");
                onChange?.({ source: a, layer: b });
              }}
            >
              {map(sources, ({ source, layer }) => (
                <Tab label={source.name} value={`${source.id}::${layer}`} />
              ))}
            </Tabs>
          </>
        )}
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
