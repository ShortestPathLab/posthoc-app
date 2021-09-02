import { Typography } from "@material-ui/core";
import { Title } from "components/Title";
import { useEffect } from "react";
import { useFeatures } from "slices/features";
import { useInfo } from "slices/info";
import Controls from "./components/control-bar/Controls";
import { makePortal } from "./makePortal";

const TopPanelPortal = makePortal("#top-panel");
const HeaderPortal = makePortal("#header");
const CanvasHeaderPortal = makePortal("#screen-heading");
const LogsHeaderPortal = makePortal("#events-heading");

function App() {
  const [info] = useInfo();
  const [features] = useFeatures();
  // TODO Remove temporary connection check
  useEffect(() => {
    console.log(info, features);
  }, [info, features]);
  return (
    <>
      <HeaderPortal replace>
        <Title />
      </HeaderPortal>
      <TopPanelPortal replace>
        <Controls />
      </TopPanelPortal>
      <CanvasHeaderPortal replace />
      <LogsHeaderPortal replace>
        <Typography variant="overline" sx={{ px: 2.5, py: 1 }} component="div">
          Logs
        </Typography>
      </LogsHeaderPortal>
    </>
  );
}

export default App;
