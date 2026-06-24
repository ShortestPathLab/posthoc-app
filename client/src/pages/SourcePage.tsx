import { Editor, Monaco } from "@monaco-editor/react";
import { CodeOutlined, SaveOutlined } from "@mui-symbols-material/w300";
import { CircularProgress, Tab, Tabs, useTheme } from "@mui/material";
import { Block } from "components/generic/Block";
import { IconButtonWithTooltip } from "components/generic/inputs/IconButtonWithTooltip";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { useMonacoTheme } from "components/script-editor/ScriptEditor";
import { getController } from "layers/layerControllers";
import { isEqual } from "es-toolkit";
import { find, flatMap, head, isObject, map } from "es-toolkit/compat";
import { useEffect, useMemo, useRef, useState } from "react";
import { AutoSizer as AutoSize } from "react-virtualized-auto-sizer";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { useLoadingState } from "slices/loading";
import { assert } from "utils/assert";
import { debounceLifo as lifo } from "utils/debounceLifo";
import { PageContentProps } from "./PageMeta";
import { YAMLException } from "js-yaml";
import { load, register } from "language";
import { produceAsync as produce } from "produce";
import { set } from "utils/set";
import { useAsync } from "react-async-hook";
import { resultAsync } from "utils/result";
import { useOne } from "slices/useOne";
import { Button } from "components/generic/inputs/Button";

export function isYamlException(e: unknown): e is YAMLException {
  return isObject(e) && "name" in e && e.name === "YAMLException";
}

type SourceLayer = Layer;

type SourceLayerState = { source?: string; layer?: string };

function useSources() {
  // TODO: Slightly not performance
  return useOne(
    slice.layers,
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
  const theme = useTheme();
  useMonacoTheme(theme);

  const sources = useSources();

  const { controls, onChange, state, dragHandle } = useViewTreeContext<SourceLayerState>();

  const { result: instance } = useAsync(() => load(), []);

  const [monaco, setMonaco] = useState<Monaco>();

  const progress = useLoadingState("layers");

  const selected = useMemo(
    () =>
      find(sources, (c) => c && c.source.id === state?.source && c.layer === state?.layer) ??
      head(sources),
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
                void (await getController(l)?.onEditSource?.(l, selected.source.id, value)),
            ),
          );
          assert(!a.error, a.error!);
          one.set(a.result);
        }),
      ),
    [selected?.layer, selected?.source?.id, progress],
  );

  const saved = selected?.source?.content;
  const [draft, setDraft] = useState(saved);

  // Reset the draft when switching to a different source (not on every saved
  // content change, which would clobber in-progress edits).
  useEffect(() => {
    setDraft(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.layer, selected?.source?.id]);

  const dirty = draft !== saved;

  const save = () => {
    if (dirty) handleEditorContentChange(draft);
  };

  // Keep the latest `save` reachable from the editor's Cmd/Ctrl+S command,
  // which is bound once on mount and would otherwise capture a stale closure.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });

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
          <Block sx={{ pt: 6 }}>
            <AutoSize
              renderProp={({ width: widthProp, height: heightProp }) => {
                // Defaults moved out of the destructure to avoid a React Compiler bailout.
                const width = widthProp ?? 0;
                const height = heightProp ?? 0;
                return (
                  instance && (
                    <Editor
                      // Refresh the editor when the id changes
                      key={`${selected?.layer}::${selected?.source?.id}`}
                      theme={theme.palette.mode === "dark" ? "posthoc-dark" : "light"}
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
                      width={width}
                      height={height}
                      defaultValue={saved}
                      onChange={setDraft}
                      onMount={(editor, m) => {
                        setMonaco(m);
                        // Cmd/Ctrl+S saves the current source.
                        editor.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.KeyS, () =>
                          saveRef.current(),
                        );
                      }}
                    />
                  )
                );
              }}
            />
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
      <Page.Extras>
        {!!sources?.length && !selected?.source?.readonly && (
          <Button
            size="small"
            color="primary"
            disabled={!dirty}
            onClick={save}
            startIcon={<SaveOutlined />}
          >
            Save
          </Button>
        )}
        {controls}
      </Page.Extras>
    </Page>
  );
}
