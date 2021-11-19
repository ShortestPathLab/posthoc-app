import { AppBar, Box, Divider, Toolbar } from "@material-ui/core";
import { Input } from "./Input";
import { Playback } from "./Playback";
import { Settings } from "./Settings";
import { Utility } from "./Utility";

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
          <Input />
          {divider}
          <Playback />
          {divider}
          <Utility />
          {divider}
          <Settings />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
