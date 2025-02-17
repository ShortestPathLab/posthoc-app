import { Editor, Monaco } from "@monaco-editor/react";
import { CodeOutlined } from "@mui-symbols-material/w400";
import { CircularProgress, Tab, Tabs, useTheme } from "@mui/material";
import { Block } from "components/generic/Block";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { useMonacoTheme } from "components/script-editor/ScriptEditor";
import { useOptimistic } from "hooks/useOptimistic";
import { getController } from "layers/layerControllers";
import { capitalize, find, first, flatMap, isObject, map } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { useLoadingState } from "slices/loading";
import { assert } from "utils/assert";
import { debounceLifo } from "utils/debounceLifo";
import { idle } from "utils/idle";
import { PageContentProps } from "./PageMeta";

import { YAMLException } from "js-yaml";
import { clone } from "produce";
import { set } from "utils/set";
import { register } from "./traceYaml";

import * as monaco from "monaco-editor";
import { useAsync } from "react-async-hook";
import { load } from "./load";

function isYamlException(e: unknown): e is YAMLException {
  return isObject(e) && "name" in e && e.name === "YAMLException";
}

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

  const { result: instance } = useAsync(() => load(), []);

  const editorRef = useRef<null | monaco.editor.IStandaloneCodeEditor>(null);
  const monacoRef = useRef<null | Monaco>(null);
  const [decorationsRef, setDecorationsRef] =
    useState<null | monaco.editor.IEditorDecorationsCollection>(null);

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
    // eslint-disable-next-line react-compiler/react-compiler
    () =>
      debounceLifo((v?: string) =>
        usingLoading(async () => {
          decorationsRef?.clear();
          if (!selected?.source?.id || !selected?.layer) return;
          const one = slice.layers.one<SourceLayer>(selected.layer);
          const l = one.get();
          assert(l, "layer is defined");
          const { result: next, error } =
            (await getController(l)?.onEditSource?.(
              clone(l),
              selected.source.id,
              v
            )) ?? {};
          clearParserErrorDecorations();
          if (error) {
            if (isYamlException(error)) {
              console.log(error);
              setParserErrorDecorations(error);
            }
            return;
          } else {
            assert(next, "updated source is defined");
            one.set(next);
          }
        })
      ),
    [usingLoading, selected?.source?.id, decorationsRef]
  );

  const [value, setValue] = useOptimistic(selected?.source?.content, (v) =>
    idle(() => handleEditorContentChange(v))
  );

  const handleEditorMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: Monaco
  ) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
    setDecorationsRef(editor.createDecorationsCollection());
  };

  useEffect(() => {
    if (monacoRef.current) {
      const dipose = register(monacoRef.current);
      return dipose;
    }
  }, [monacoRef.current]);

  const clearParserErrorDecorations = () => {
    monacoRef.current?.editor.setModelMarkers(
      editorRef.current!.getModel()!,
      "owner",
      []
    );
  };

  const setParserErrorDecorations = (error: YAMLException) => {
    const startLine = error.mark.line + 1;
    const startColumn = error.mark.column + 1;

    monacoRef.current?.editor.setModelMarkers(
      editorRef.current!.getModel()!,
      "owner",
      [
        {
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: startLine,
          startColumn,
          endLineNumber: startLine,
          endColumn: startColumn,
          message: `YAMLException: ${capitalize(error.reason)}`,
        },
      ]
    );
  };

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
                    onMount={handleEditorMount}
                    // Refresh the editor when the id changes
                    key={selected?.source?.id}
                    theme={
                      theme.palette.mode === "dark" ? "posthoc-dark" : "light"
                    }
                    options={{
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
