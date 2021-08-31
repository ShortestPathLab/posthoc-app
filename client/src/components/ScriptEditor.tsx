import { Box } from "@material-ui/core";
import Editor from "@monaco-editor/react";
import { trim } from "lodash";

const PLACEHOLDER = trim(`
/**
 * Define in what situations the debugger should break.
 */
function shouldBreak(arg1, arg2, arg3) {
    return false;
}

/**
 * Define which objects the renderer should display.
 */
function shouldRender(arg1, arg2, arg3) {
    return true;
}
`);

export function ScriptEditor() {
  return (
    <Box height="70vh" overflow="hidden">
      <Editor
        height="100%"
        language="javascript"
        defaultValue={PLACEHOLDER}
        options={{
          minimap: {
            enabled: false,
          },
        }}
      />
    </Box>
  );
}
