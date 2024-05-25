import { Editor } from "@monaco-editor/react";
import {
  CodeOutlined,
  LayersOutlined as LayersIcon,
} from "@mui/icons-material";
import {
  CircularProgress,
  Tab,
  Tabs,
  useTheme,
  useThemeProps,
} from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Flex } from "components/generic/Flex";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { inferLayerName } from "layers/inferLayerName";
import { getController } from "layers/layerControllers";
import { find, first, map } from "lodash";
import { useMemo } from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { Layer, useLayer } from "slices/layers";
import { divider } from "./Page";
import { PageContentProps } from "./PageMeta";
import { useMonacoTheme } from "components/script-editor/ScriptEditor";

type SourceLayer = Layer;

const isSourceLayer = (l: Layer): l is SourceLayer =>
  !!getController(l)?.getSources;

type SourceLayerState = { source?: string };

export function SourcePage({ template: Page }: PageContentProps) {
  const theme = useTheme();

  useMonacoTheme(theme);

  const { key, setKey, layer, layers, allLayers } = useLayer(
    undefined,
    isSourceLayer
  );

  const { controls, onChange, state, dragHandle } =
    useViewTreeContext<SourceLayerState>();

  const source = useMemo(
    () => getController(layer)?.getSources?.(layer),
    [layer]
  );

  const selected = find(source, { id: state?.source }) ?? first(source);

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>source</Page.Key>

      <Page.Title>Source</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        {source?.length ? (
          <Flex pt={6}>
            <AutoSize>
              {(size) => (
                <Editor
                  theme={
                    theme.palette.mode === "dark" ? "posthoc-dark" : "light"
                  }
                  options={{
                    readOnly: true,
                  }}
                  language={selected?.language}
                  loading={<CircularProgress variant="indeterminate" />}
                  {...size}
                  value={selected?.content}
                />
              )}
            </AutoSize>
          </Flex>
        ) : (
          <Placeholder icon={<CodeOutlined />} label="Source" />
        )}
      </Page.Content>
      <Page.Options>
        <FeaturePicker
          icon={<LayersIcon />}
          label="Layer"
          value={key}
          items={map(allLayers, (l) => ({
            id: l.key,
            hidden: !find(layers, { key: l.key }),
            name: inferLayerName(l),
          }))}
          onChange={setKey}
          arrow
          ellipsis={12}
        />
        {!!source?.length && (
          <>
            {divider}
            <Tabs
              value={state?.source ?? first(source)?.id}
              onChange={(_, v) => onChange?.({ source: v })}
            >
              {map(source, ({ name, id }) => (
                <Tab label={name} value={id} />
              ))}
            </Tabs>
          </>
        )}
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
