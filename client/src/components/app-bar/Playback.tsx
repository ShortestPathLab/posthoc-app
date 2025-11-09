import {
  ArrowForwardOutlined,
  ChevronRightOutlined as NextIcon,
  PauseOutlined as PauseIcon,
  PlayArrowOutlined as PlayIcon,
  ChevronLeftOutlined as PreviousIcon,
  SkipNextOutlined as SkipIcon,
  SkipPreviousOutlined as StopIcon,
} from "@mui-symbols-material/w300";
import {
  Button,
  Collapse,
  Divider,
  InputAdornment,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { EditorSetterProps } from "components/Editor";
import { IconButtonWithTooltip as IconButton } from "components/generic/inputs/IconButtonWithTooltip";
import { computed, usePlaybackControls } from "hooks/usePlaybackState";
import { ceil, noop } from "lodash-es";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";
import { useEffect, useState } from "react";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { usePaper } from "theme";

const divider = <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;

export type PlaybackLayerData = {
  key?: string;
  step?: number;
  output?: { [key: string]: { step?: number; result: string }[] };
  playback?: "playing" | "paused";
  playbackTo?: number;
};

const FRAME_TIME_MS = 1000 / 60;

function usePlaybackServiceState(layer?: string) {
  "use no memo";
  const one = slice.layers.one<Layer<PlaybackLayerData>>(layer);
  return {
    playing: one.use(computed("playing")),
    step: one.use(computed("step")),
    end: one.use(computed("end")),
  };
}

export function PlaybackService({
  children,
  value,
}: EditorSetterProps<Layer<PlaybackLayerData>>) {
  "use no memo";
  const { playing, step = 0, end = 0 } = usePlaybackServiceState(value?.key);

  const { pause, stepWithBreakpointCheck } = usePlaybackControls(value?.key);

  const { "playback/playbackRate": playbackRate = 1 } = slice.settings.use();

  useEffect(() => {
    if (playing) {
      let cancelled = false;
      let cancel = noop;
      let prev = Date.now();
      const f = () => {
        if (!cancelled) {
          const now = Date.now();
          const elapsed = ceil((playbackRate * (now - prev)) / FRAME_TIME_MS);
          if (step < end) {
            cancel = stepWithBreakpointCheck(elapsed);
            prev = now;
          } else {
            cancelled = true;
            pause();
          }
          requestAnimationFrame(f);
        }
      };
      requestAnimationFrame(f);
      return () => {
        cancel();
        cancelled = true;
      };
    }
  }, [stepWithBreakpointCheck, playing, end, step, pause, playbackRate]);

  return <>{children}</>;
}

const centered = { horizontal: "center", vertical: "center" } as const;

function usePlaybackControlsState(layer?: string) {
  "use no memo";
  const one = slice.layers.one<Layer<PlaybackLayerData>>(layer);
  return {
    canPause: one.use(computed("canPause")),
    canPlay: one.use(computed("canPlay")),
    canStepBackward: one.use(computed("canStepBackward")),
    canStepForward: one.use(computed("canStepForward")),
    canStop: one.use(computed("canStop")),
    playing: one.use(computed("playing")),
  };
}

export function Playback({ layer }: { layer?: string }) {
  const {
    canPause,
    canStepBackward,
    canStepForward,
    canStop,
    playing,
    canPlay,
  } = usePlaybackControlsState(layer);

  const { pause, play, stepBackward, stepForward, findBreakpoint, stepTo } =
    usePlaybackControls(layer);

  return (
    <>
      <IconButton
        label="previous-breakpoint"
        icon={<StopIcon />}
        onClick={() => {
          stepTo(findBreakpoint(-1));
        }}
        disabled={!canStop || !canStepBackward}
      />
      <IconButton
        label="step-backward"
        icon={<PreviousIcon />}
        onClick={stepBackward}
        disabled={!canStepBackward}
      />
      <IconButton
        {...(playing
          ? {
              label: "pause",
              icon: <PauseIcon />,
              onClick: () => pause(),
              disabled: !canPause,
            }
          : {
              label: "play",
              icon: <PlayIcon />,
              onClick: () => play(),
              disabled: !canPlay,
              color: "primary",
            })}
      />
      <IconButton
        label="step-forward"
        icon={<NextIcon />}
        onClick={stepForward}
        disabled={!canStepForward}
      />
      <IconButton
        label="next-breakpoint"
        icon={<SkipIcon />}
        onClick={() => {
          stepTo(findBreakpoint());
        }}
        disabled={!canStepForward}
      />
      {divider}
      <JumpToStep layer={layer} />
    </>
  );
}

export function useStep(layer?: string) {
  "use no memo";
  return slice.layers
    .one<Layer<PlaybackLayerData>>(layer)
    .use(computed("step"));
}

function JumpToStep({ layer }: { layer?: string }) {
  const paper = usePaper();
  const [stepInput, setStepInput] = useState("");
  const parsedStepInput = parseInt(stepInput);
  const parsedStepInputValid = !isNaN(parsedStepInput);

  const step = useStep(layer);

  const { stepTo } = usePlaybackControls(layer);
  return (
    <PopupState variant="popover">
      {(state) => (
        <>
          <Button sx={{ minWidth: 0 }} {...bindTrigger(state)}>
            <Typography
              component="div"
              variant="body2"
              color="text.secondary"
              sx={{
                px: 0.25,
                py: 0.25,
                textAlign: "center",
                ...paper(0),
                borderRadius: 1,
              }}
            >
              {step}
            </Typography>
          </Button>
          <Popover
            {...bindPopover(state)}
            anchorOrigin={centered}
            transformOrigin={centered}
          >
            <TextField
              autoFocus
              onChange={(e) => setStepInput(e.target.value)}
              defaultValue={step}
              placeholder="0"
              sx={{ width: 180, border: "none" }}
              slotProps={{
                input: {
                  sx: { fontSize: "0.875rem" },
                  startAdornment: (
                    <InputAdornment position="start">Step</InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        icon={<ArrowForwardOutlined />}
                        label="Go"
                        size="small"
                        color="inherit"
                        disabled={
                          !parsedStepInputValid || parsedStepInput === step
                        }
                        onClick={() => {
                          stepTo(parsedStepInput);
                          state.close();
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Popover>
        </>
      )}
    </PopupState>
  );
}

export function MinimisedPlaybackControls({ layer: key }: { layer?: string }) {
  return (
    <PopupState variant="popover">
      {(state) => (
        <>
          <Collapse in={state.isOpen} orientation="horizontal">
            <Stack direction="row" sx={{ minWidth: "max-content" }}>
              <Playback layer={key} />
              {divider}
            </Stack>
          </Collapse>
          <IconButton
            size="small"
            onClick={state.toggle}
            label={
              state.isOpen ? "Hide Playback Controls" : "Show Playback Controls"
            }
            sx={{
              mx: -1,
              color: (t) => t.palette.text.secondary,
              transform: state.isOpen ? "rotate(180deg)" : undefined,
              transition: (t) => t.transitions.create("transform"),
            }}
            icon={<NextIcon />}
          />
        </>
      )}
    </PopupState>
  );
}
