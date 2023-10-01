import Editor from "@monaco-editor/react";
import { CircularProgress, useTheme } from "@mui/material";
import { debounce } from "lodash";
import AutoSize from "react-virtualized-auto-sizer";
import { Flex } from "components/generic/Flex";
import { useUIState } from "slices/UIState";

const DELAY = 2500;

export function ScriptEditor() {
  const [{ code }, setUIState] = useUIState();
  const theme = useTheme();
  return (
    <Flex height="100%" overflow="hidden">
      <AutoSize>
        {({ width, height }) => (
          <Editor
            theme={theme.palette.mode === "dark" ? "vs-dark" : "light"}
            width={width}
            loading={<CircularProgress variant="indeterminate" />}
            height={height}
            language="javascript"
            defaultValue={code}
            onChange={debounce((v) => setUIState({ code: v }), DELAY)}
            options={{
              minimap: {
                enabled: false,
              },
            }}
          />
        )}
      </AutoSize>
    </Flex>
  );
}