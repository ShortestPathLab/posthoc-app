import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { Controls } from "components/app-bar/Controls";
import { Flex } from "components/generic/Flex";
import { Inspector } from "components/inspector";
import { useMedia } from "react-use";
import { getTheme } from "theme";
import { useMemo } from "react";

function App() {
  const prefersDark = useMedia('(prefers-color-scheme: dark)');
  const theme = useMemo(() => getTheme(prefersDark), [prefersDark]);
  return (
    <CssBaseline>
    <ThemeProvider theme={theme}>
      <Flex vertical sx={{ bgcolor: "background.default" }}>
        <Controls />
        <Inspector flex={1} />
      </Flex>
    </ThemeProvider>
    </CssBaseline>
  );
}

export default App;
