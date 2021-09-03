import { AppBar, Box, Divider, Toolbar } from "@material-ui/core";
import { CameraControls } from "./CameraControls";
import { InputControls } from "./InputControls";
import { PlaybackControls } from "./PlaybackControls";
import { UtilityControls } from "./UtilityControls";

export default function Controls() {
  function renderDivider() {
    return <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;
  }
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar>
        <Box m={-1} display="flex" alignItems="center">
          <InputControls />
          {renderDivider()}
          <PlaybackControls />
          {renderDivider()}
          <UtilityControls />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
