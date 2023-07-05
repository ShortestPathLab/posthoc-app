import { CircularProgress } from "@mui/material";
import Editor from "@monaco-editor/react";
import { Flex } from "components/generic/Flex";
import { debounce } from "lodash";
import AutoSize from "react-virtualized-auto-sizer";
import { useUIState } from "slices/UIState";

const DELAY = 2500;

export function ScriptEditor() {
  const [{ code }, setUIState] = useUIState();
  return (
    <Flex height="70vh" overflow="hidden">
      <AutoSize>
        {({ width, height }) => (
          <Editor
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
