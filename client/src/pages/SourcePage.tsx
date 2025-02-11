import { Editor } from "@monaco-editor/react";
import { CodeOutlined } from "@mui-symbols-material/w400";
import { CircularProgress, Tab, Tabs, useTheme } from "@mui/material";
import { Block } from "components/generic/Block";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { useMonacoTheme } from "components/script-editor/ScriptEditor";
import { getController } from "layers/layerControllers";
import { find, first, flatMap, map } from "lodash";
import { useMemo } from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { useLoadingState } from "slices/loading";
import { assert } from "utils/assert";
import { debounceLifo } from "utils/debounceLifo";
import { idle } from "utils/idle";
import { PageContentProps } from "./PageMeta";
import { useOptimistic } from "hooks/useOptimistic";

type SourceLayer = Layer;

type SourceLayerState = { source?: string; layer?: string };

function useSources() {
  "use no memo";
  // TODO: Slightly not performance
  return slice.layers.use((l) =>
    flatMap(l, (l) =>
      map(getController(l)?.getSources?.(l), (s) => ({
        layer: l.key,
        source: s,
      }))
    )
  );
}

export function SourcePage({ template: Page }: PageContentProps) {
  const theme = useTheme();
  useMonacoTheme(theme);

  const sources = useSources();

  const { controls, onChange, state, dragHandle } =
    useViewTreeContext<SourceLayerState>();

  const usingLoading = useLoadingState("layers");

  const selected = useMemo(
    () =>
      find(
        sources,
        (c) => c && c.source.id === state?.source && c.layer === state?.layer
      ) ?? first(sources),
    [sources, state?.source, state?.layer]
  );
  const handleEditorContentChange = useMemo(
    () =>
      debounceLifo((v?: string) =>
        usingLoading(async () => {
          if (!selected?.source?.id || !selected?.layer) return;
          const one = slice.layers.one<SourceLayer>(selected.layer);
          const l = one.get();
          assert(l, "layer is defined");
          const next = await getController(l)?.onEditSource?.(
            l,
            selected.source.id,
            v
          );
          assert(next, "updated source is defined");
          one.set(next);
        })
      ),
    [usingLoading, selected?.source?.id]
  );

  const [value, setValue] = useOptimistic(selected?.source?.content, (v) =>
    idle(() => handleEditorContentChange(v))
  );

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>source</Page.Key>
      <Page.Title>Source</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        {sources?.length ? (
          <Block pt={6}>
            <AutoSize>
              {(size: { width: number; height: number }) => (
                <Editor
                  theme={
                    theme.palette.mode === "dark" ? "posthoc-dark" : "light"
                  }
                  options={{
                    readOnly: !!selected?.source?.readonly,
                  }}
                  language={selected?.source?.language}
                  loading={<CircularProgress variant="indeterminate" />}
                  {...size}
                  value={value}
                  onChange={setValue}
                />
              )}
            </AutoSize>
          </Block>
        ) : (
          <Placeholder icon={<CodeOutlined />} label="Source" />
        )}
      </Page.Content>
      <Page.Options>
        {!!sources?.length && (
          <Tabs
            value={`${selected?.source.id}::${selected?.layer}`}
            onChange={(_, v: string) => {
              const [a, b] = v.split("::");
              onChange?.({ source: a, layer: b });
            }}
          >
            {map(sources, ({ source, layer }) => (
              <Tab
                label={
                  source.readonly ? (
                    <span>
                      <span>{source.name}</span> <i>(Read-only)</i>
                    </span>
                  ) : (
                    source.name
                  )
                }
                value={`${source.id}::${layer}`}
              />
            ))}
          </Tabs>
        )}
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
