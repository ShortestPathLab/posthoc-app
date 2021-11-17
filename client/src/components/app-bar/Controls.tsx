import { AppBar, Box, Divider, Toolbar } from "@material-ui/core";
import { InputControls } from "./InputControls";
import { PlaybackControls } from "./PlaybackControls";
import { UtilityControls } from "./UtilityControls";

const divider = <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;

export function Controls() {
  return (
    <AppBar
      position="static"
      sx={{ bgcolor: "background.paper" }}
      elevation={0}
    >
      <Toolbar>
        <Box m={-1} display="flex" alignItems="center">
          <InputControls />
          {divider}
          <PlaybackControls />
          {divider}
          <UtilityControls />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
