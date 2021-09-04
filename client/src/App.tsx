import Controls from "components/control-bar/Controls";
import { Flex } from "components/Flex";
import { SpecimenInspector } from "components/specimen-inspector/SpecimenInspector";
import { Title } from "components/Title";
import { useEffect } from "react";
import { useInfo } from "slices/info";

function App() {
  // TODO Remove temporary connection check
  const [info] = useInfo();
  useEffect(() => console.log(info), [info]);
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
