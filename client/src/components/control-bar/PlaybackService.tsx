import { Box } from "@material-ui/core";
import { Flex } from "components/generic/Flex";
import { call } from "components/script-editor/call";
import { transpile } from "components/script-editor/transpile";
import { useSnackbar } from "components/Snackbar";
import { Space } from "components/generic/Space";
import { usePlaybackState } from "hooks/usePlaybackState";
import { memoize } from "lodash";
import { useEffect, useMemo } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";

const USE_EVAL = true;

function cancellable<T = void>(f: () => Promise<T>, g: (result: T) => void) {
  let cancelled = false;
  requestAnimationFrame(async () => {
    const result = await f();
    if (!cancelled) {
      g(result);
    }
  });
  return () => {
    cancelled = true;
  };
}

function useBreakpoints() {
  const [specimen] = useSpecimen();
  const [{ code }] = useUIState();
  const es5 = useMemo(() => transpile(code), [code]) ?? "";

  return useMemo(
    () =>
      memoize(async (step: number) => {
        const event = specimen?.eventList?.[step];
        return event
          ? await call(es5, "shouldBreak", [step, event], false, USE_EVAL)
          : false;
      }),
    [es5, specimen]
  );
}

export function PlaybackService() {
  const notify = useSnackbar();
  const { playing, end, step, pause, stepForward } = usePlaybackState();
  const shouldBreak = useBreakpoints();

  useEffect(() => {
    if (playing) {
      if (step < end) {
        return cancellable(
          () => shouldBreak(step),
          (result) => {
            if (result) {
              notify(
                <Flex>
                  <Box>Breakpoint hit.</Box>
                  <Space />
                  <Box sx={{ opacity: 0.56 }}>{`Step ${step}`}</Box>
                </Flex>
              );
              pause();
            } else {
              stepForward();
            }
          }
        );
      } else pause();
    }
  }, [playing, end, step, pause, stepForward, notify, shouldBreak]);

  return <></>;
}
