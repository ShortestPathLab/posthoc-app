import { CircularProgress } from "@material-ui/core";
import Editor from "@monaco-editor/react";
import { Flex } from "components/generic/Flex";
import { debounce } from "lodash";
import { AutoSizer as AutoSize } from "react-virtualized";
import { useUIState } from "slices/UIState";

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
            onChange={debounce((v) => setUIState({ code: v }), 1000)}
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
