import { Controls } from "components/app-bar/Controls";
import { Flex } from "components/generic/Flex";
import { Inspector } from "components/inspector";

function App() {
  return (
    <Flex vertical sx={{ bgcolor: "background.default" }}>
      <Controls />
      <Inspector flex={1} />
    </Flex>
  );
}

export default App;
