import { Editor, Monaco, useMonaco } from "@monaco-editor/react";
import { CodeOutlined } from "@mui-symbols-material/w400";
import { CircularProgress, Tab, Tabs, useTheme } from "@mui/material";
import { Flex } from "components/generic/Flex";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { useMonacoTheme } from "components/script-editor/ScriptEditor";
import { LayerSource } from "layers";
import { getController } from "layers/layerControllers";
import { find, first, map } from "lodash";
import { transactionAsync } from "produce";
import { useEffect, useMemo, useRef, useState } from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { Layer, useLayer } from "slices/layers";
import { useLoadingState } from "slices/loading";
import { debounceLifo } from "utils/debounceLifo";
import { PageContentProps } from "./PageMeta";
import { OutError, OutErrorDetails } from "workers/usingWorker";
import * as monaco from "monaco-editor";
import { Button } from "components/generic/Button";
type SourceLayer = Layer;

const isSourceLayer = (l: Layer): l is SourceLayer =>
  !!getController(l)?.getSources;

type SourceLayerState = { source?: string; layer?: string };

export function SourcePage({ template: Page }: PageContentProps) {
  const theme = useTheme();
  useMonacoTheme(theme);
  const [editorError, setEditorError] = useState<null | OutErrorDetails>(null);
  const { layers, setLayer, setKey } = useLayer(undefined, isSourceLayer);

  const sources = useMemo(
    () =>
      layers?.flatMap?.((l) =>
        getController(l)
          ?.getSources?.(l)
          ?.map?.((c) => ({
            layer: l.key,
            source: c,
          })),
      ) as { layer: string; source: LayerSource }[],
    [layers],
  );

  const { controls, onChange, state, dragHandle } =
    useViewTreeContext<SourceLayerState>();

  const editorRef = useRef<null | monaco.editor.IStandaloneCodeEditor>(null);
  const monacoRef = useRef<null | Monaco>(null);
  const decorationsRef =
    useRef<null | monaco.editor.IEditorDecorationsCollection>(null);

  const usingLoading = useLoadingState("layers");

  const selected = useMemo(
    () =>
      find(
        sources,
        (c) => c && c.source.id === state?.source && c.layer === state?.layer,
      ) ?? first(sources),
    [sources, state?.source, state?.layer],
  );
  useEffect(
    () => void (selected?.layer && setKey(selected?.layer)),
    [setKey, selected?.layer],
  );
  const [locked, setLocked] = useState(
    !!selected?.source?.readonly ? null : true,
  );
  const handleEditorMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: Monaco,
  ) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    decorationsRef.current = editor.createDecorationsCollection();
  };
  const addEditorModelMarker = ({}: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    message: string;
    severity: Monaco["MarkerSeverity"];
  }) => {
    // editor;
  };

  const handleEditorContentChange = useMemo(
    () =>
      debounceLifo((value) =>
        usingLoading(() =>
          setLayer(
            async (l) =>
              (await transactionAsync(l, async (l) => {
                try {
                  decorationsRef.current?.clear();
                  const modifiedLayer = await getController(l)?.onEditSource?.(
                    l,
                    selected?.source?.id,
                    value,
                  );
                  setEditorError(null);
                  return modifiedLayer;
                } catch (error) {
                  if (error instanceof OutError) {
                    console.log(error.details);
                    const startLine = error.details.mark.line;
                    const endLine = startLine;
                    const startColumn = error.details.mark.column;
                    const endColumn = startColumn;

                    console.log(decorationsRef.current);
                    decorationsRef.current?.set([
                      {
                        range: new monaco.Range(
                          startLine,
                          startColumn,
                          endLine,
                          endColumn,
                        ),
                        options: {
                          isWholeLine: true,
                          className: "error-text",
                          glyphMarginClassName: "icon-glyph",
                          glyphMarginHoverMessage: {
                            value: error.details.reason,
                          },
                        },
                      },
                    ]);
                  }
                }
              })) ?? l,
          ),
        ),
      ),
    [usingLoading, selected?.source?.id, setLayer],
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
              {(size: { width: number; height: number }) => (
                <Editor
                  onMount={handleEditorMount}
                  // Refresh the editor when the id changes
                  key={selected?.source?.id}
                  theme={
                    theme.palette.mode === "dark" ? "posthoc-dark" : "light"
                  }
                  options={{
                    readOnly: !!selected?.source?.readonly,
                    renderValidationDecorations: "on",
                    glyphMargin: true,
                  }}
                  language={selected?.source?.language}
                  loading={<CircularProgress variant="indeterminate" />}
                  {...size}
                  // If source is readonly, use value, so the value updates the editor.
                  // Otherwise, don't update the editor when value changes
                  // for better editing experience
                  {...{
                    [selected?.source?.readonly ? "value" : "defaultValue"]:
                      selected?.source?.content,
                  }}
                  onChange={handleEditorContentChange}
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
