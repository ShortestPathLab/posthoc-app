import { Divider } from "@material-ui/core";
import { Flex } from "components/Flex";
import { SpecimenViewer as SpecimenViewer } from "components/specimen-viewer/SpecimenViewer";
import { Title } from "components/Title";
import { useEffect } from "react";
import { useInfo } from "slices/info";
import Controls from "components/control-bar/Controls";

function App() {
  // TODO Remove temporary connection check
  const [info] = useInfo();
  useEffect(() => console.log(info), [info]);
  return (
    <Flex vertical>
      <Flex vertical boxShadow={4} height="auto">
        <Title />
        <Controls />
      </Flex>
      <SpecimenViewer flex={1} />
    </Flex>
  );
}

export default App;
