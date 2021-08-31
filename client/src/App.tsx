import { Typography } from "@material-ui/core";
import { Title } from "components/Title";
import Controls from "./components/control-bar/Controls";
import { makePortal } from "./makePortal";

const TopPanelPortal = makePortal("#top-panel");
const HeaderPortal = makePortal("#header");
const CanvasHeaderPortal = makePortal("#screen-heading");
const LogsHeaderPortal = makePortal("#events-heading");

function App() {
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
