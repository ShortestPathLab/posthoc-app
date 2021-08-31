import { Box } from "@material-ui/core";
import Editor from "@monaco-editor/react";
import { trim } from "lodash";

const PLACEHOLDER = trim(`
/**
 * Define in what situations the debugger should break,
 * in addition to the conditions defined in the standard options.
 */
function shouldBreak(foo, bar, baz) {
    return false;
}

/**
 * Define which objects the renderer should display,
 * in addition to the conditions defined in the standard options.
 */
function shouldRender(foo, bar, baz) {
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
