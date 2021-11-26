import { Controls } from "components/app-bar/Controls";
import { Flex } from "components/generic/Flex";
import { SpecimenInspector } from "components/specimen-inspector/SpecimenInspector";

function App() {
  return (
    <Flex vertical sx={{ bgcolor: "background.default" }}>
      <Controls />
      <SpecimenInspector flex={1} />
    </Flex>
  );
}

export default App;
