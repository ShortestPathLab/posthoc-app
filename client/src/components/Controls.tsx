import { AppBar, Box, Button, Divider, Toolbar } from "@material-ui/core";
import { useCompatibilityLayer } from "hooks/useCompatibilityLayer";
import { PlaybackControls } from "./PlaybackControls";
import { IconButtonWithTooltip as IconButton } from "./IconButtonWithTooltip";
import { usePlaybackState } from "hooks/usePlaybackState";
import Controller from "old/controller";

function Utilities() {
  const ready = usePlaybackState() !== "none";
  const INTEROP_breakpoints = useCompatibilityLayer("#breakpoints button");
  const INTEROP_compare = useCompatibilityLayer("#comparator button");
  const INTEROP_timeTravel = useCompatibilityLayer("#time-travel button");
  return (
    <>
      <Button disabled={!ready} onClick={INTEROP_breakpoints}>
        Breakpoints...
      </Button>
      <Button disabled={!ready} onClick={INTEROP_compare}>
        Compare...
      </Button>
      <Button disabled={!ready} onClick={INTEROP_timeTravel}>
        Jump...
      </Button>
    </>
  );
}

function InputControls() {
  const INTEROP_selectMap = useCompatibilityLayer("#map input");
  const INTEROP_selectAlgorithm = useCompatibilityLayer("#algorithm input");
  return (
    <>
      <Button onClick={INTEROP_selectMap}>Choose Map</Button>
      <Button onClick={INTEROP_selectAlgorithm}>Choose Algorithm</Button>
    </>
  );
}

function CameraControls() {
  const ready = usePlaybackState() !== "none";
  return (
    <>
      <Button disabled={!ready} onClick={() => Controller.fitMap()}>
        Fit All
      </Button>
      <Button disabled={!ready} onClick={() => Controller.fitDebugger()}>
        Fit Trace
      </Button>
      <Button disabled={!ready} onClick={() => Controller.fitScale()}>
        100%
      </Button>
    </>
  );
}

export default function Controls() {
  function renderDivider() {
    return <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;
  }
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar>
        <Box m={-1} display="flex">
          <InputControls />
          {renderDivider()}
          <PlaybackControls />
          {renderDivider()}
          <Utilities />
          {renderDivider()}
          <CameraControls />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
