import { Editor, Monaco } from "@monaco-editor/react";
import { CodeOutlined } from "@mui-symbols-material/w400";
import { CircularProgress, Tab, Tabs, useTheme } from "@mui/material";
import { Block } from "components/generic/Block";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { useMonacoTheme } from "components/script-editor/ScriptEditor";
import { useOptimistic } from "hooks/useOptimistic";
import { getController } from "layers/layerControllers";
import { find, first, flatMap, isEqual, isObject, map } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { useLoadingState } from "slices/loading";
import { assert } from "utils/assert";
import { debounceLifo as lifo } from "utils/debounceLifo";
import { idle } from "utils/idle";
import { PageContentProps } from "./PageMeta";
import { YAMLException } from "js-yaml";
// import { load, register } from "language";
import { produceAsync as produce } from "produce";
import { set } from "utils/set";
import { useAsync } from "react-async-hook";
import { resultAsync } from "utils/result";

export function isYamlException(e: unknown): e is YAMLException {
  return isObject(e) && "name" in e && e.name === "YAMLException";
}

type SourceLayer = Layer;

type SourceLayerState = { source?: string; layer?: string };

function useSources() {
  "use no memo";
  // TODO: Slightly not performance
  return slice.layers.use(
    (l) =>
      flatMap(l, (l) =>
        map(getController(l)?.getSources?.(l), (s) => ({
          layer: l.key,
          source: s,
        })),
      ),
    isEqual,
  );
}

export function SourcePage({ template: Page }: PageContentProps) {
  return null;
  const theme = useTheme();
  useMonacoTheme(theme);

  const sources = useSources();

  const { controls, onChange, state, dragHandle } =
    useViewTreeContext<SourceLayerState>();

  const { result: instance } = useAsync(() => load(), []);

  const [monaco, setMonaco] = useState<Monaco>();

  const progress = useLoadingState("layers");

  const selected = useMemo(
    () =>
      find(
        sources,
        (c) => c && c.source.id === state?.source && c.layer === state?.layer,
      ) ?? first(sources),
    [sources, state?.source, state?.layer],
  );
  const handleEditorContentChange = useMemo(
    () =>
      lifo((value?: string) =>
        progress(async () => {
          if (!selected?.source?.id || !selected?.layer) return;
          const one = slice.layers.one<SourceLayer>(selected.layer);
          const layer = one.get();
          assert(layer, "layer is defined");
          const a = await resultAsync<SourceLayer, Error>(() =>
            produce(
              layer,
              async (l) =>
                void (await getController(l)?.onEditSource?.(
                  l,
                  selected.source.id,
                  value,
                )),
            ),
          );
          assert(!a.error, a.error!);
          one.set(a.result);
        }),
      ),
    [selected?.layer, selected?.source?.id],
  );

  const [value, setValue] = useOptimistic(selected?.source?.content, (v) =>
    idle(() => handleEditorContentChange(v)),
  );

  useEffect(() => {
    if (monaco) {
      register(monaco);
    }
  }, [monaco]);

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Key>source</Page.Key>
      <Page.Title>Source</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        {sources?.length ? (
          <Block pt={6}>
            <AutoSize>
              {(size: { width: number; height: number }) =>
                instance && (
                  <Editor
                    onMount={(_, m) => setMonaco(m)}
                    // Refresh the editor when the id changes
                    key={`${selected?.layer}::${selected?.source?.id}`}
                    theme={
                      theme.palette.mode === "dark" ? "posthoc-dark" : "light"
                    }
                    options={{
                      hover: { above: false },
                      fixedOverflowWidgets: true,
                      bracketPairColorization: { enabled: true },
                      readOnly: !!selected?.source?.readonly,
                      renderValidationDecorations: "on",
                      glyphMargin: true,
                    }}
                    language={selected?.source?.language}
                    loading={<CircularProgress variant="indeterminate" />}
                    {...size}
                    defaultValue={value}
                    onChange={setValue}
                  />
                )
              }
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
              onChange?.((l) => {
                set(l, "source", a);
                set(l, "layer", b);
              });
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
