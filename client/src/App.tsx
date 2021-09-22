import { Controls } from "components/control-bar/Controls";
import { Flex } from "components/generic/Flex";
import { SpecimenInspector } from "components/specimen-inspector/SpecimenInspector";
import { Title } from "components/Title";

function App() {
  return (
    <Flex vertical>
      <Flex vertical boxShadow={4} height="auto" zIndex={1}>
        <Title />
        <Controls />
      </Flex>
      <SpecimenInspector flex={1} />
    </Flex>
  );
}

export default App;
