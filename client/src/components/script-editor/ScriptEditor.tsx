import Editor, { useMonaco } from "@monaco-editor/react";
import { CircularProgress, Theme, useTheme } from "@mui/material";
import { Block } from "components/generic/Block";
import { debounce } from "lodash";
import { ComponentProps } from "react";
import AutoSize from "react-virtualized-auto-sizer";

const DELAY = 2500;

export function ScriptEditor({
  code,
  onChange,
}: {
  code?: string;
  onChange?: (code?: string) => void;
}) {
  const theme = useTheme();

  useMonacoTheme(theme);

  return (
    <Block height="100%" overflow="hidden">
      <AutoSize>
        {({ width, height }) => (
          <Editor
            theme={theme.palette.mode === "dark" ? "posthoc-dark" : "light"}
            width={width}
            loading={<CircularProgress variant="indeterminate" />}
            height={height}
            language="javascript"
            defaultValue={code}
            onChange={debounce((v) => onChange?.(v), DELAY)}
            options={{
              minimap: {
                enabled: false,
              },
            }}
          />
        )}
      </AutoSize>
    </Block>
  );
}

export function useMonacoTheme(theme: Theme) {
  const monaco = useMonaco();
  monaco?.editor?.defineTheme("posthoc-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": theme.palette.background.paper,
    },
  });
}

export function ScriptViewer(props: ComponentProps<typeof Editor>) {
  const theme = useTheme();
  useMonacoTheme(theme);
  return (
    <Block height="100%" overflow="hidden">
      <AutoSize>
        {({ width, height }) => (
          <Editor
            theme={theme.palette.mode === "dark" ? "posthoc-dark" : "light"}
            width={width}
            loading={<CircularProgress variant="indeterminate" />}
            height={height}
            language="javascript"
            {...props}
            options={{
              minimap: {
                enabled: false,
              },
              ...props.options,
            }}
          />
        )}
      </AutoSize>
    </Block>
  );
}
