import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  alpha,
} from "@mui/material";
import { Scroll } from "components/generic/Scrollbars";
import { head, values } from "lodash";
import { ReactNode, useEffect } from "react";
import { useAsync } from "react-async-hook";
import { useMap } from "react-use";
import { useScreenshots } from "slices/screenshots";
import { usePaper } from "theme";

const defaultScreenshotRenderer = (s?: string) => <img src={s} />;
function Screenshot({
  screenshot,
  renderScreenshot = defaultScreenshotRenderer,
}: {
  screenshot?: () => Promise<string | undefined>;
  renderScreenshot: (s?: string, loading?: boolean) => ReactNode;
}) {
  const { result, loading } = useAsync(async () => {
    return await screenshot?.();
  }, [screenshot]);
  return renderScreenshot(result, loading);
}
export function Gallery({
  onChange,
}: {
  onChange?: (screenshots: string[]) => void;
}) {
  const paper = usePaper();
  const [screenshots] = useScreenshots();
  const [selected, { set, remove }] = useMap<{
    [K in string]: string;
  }>();
  useEffect(() => {
    onChange?.(values(selected));
  }, [selected]);
  function handleChange(i: number, v: boolean, s?: string) {
    if (v && s) {
      set(`${i}`, s);
    } else {
      remove(`${i}`);
    }
  }
  useAsync(async () => {
    const f = head(values(screenshots));
    const s = await f?.();
    if (s) {
      handleChange(0, true, s);
    }
  }, [screenshots]);
  return (
    <Scroll x py={2}>
      <Stack direction="row">
        {values(screenshots).map((s, i) => (
          <Screenshot
            key={i}
            screenshot={s}
            renderScreenshot={(screenshot, loading) => (
              <>
                <Box
                  sx={{
                    minWidth: "320px",
                    height: "320px",
                    flex: 0,
                    p: 2,
                    "&:not(:last-child)": { pr: 1 },
                  }}
                >
                  <Box
                    sx={{ position: "relative", ...paper(1), height: "100%" }}
                  >
                    {!!screenshot && (
                      <Box
                        sx={{
                          backgroundImage: (t) =>
                            `linear-gradient(to bottom, ${alpha(
                              t.palette.background.paper,
                              0.5
                            )}, transparent), url("${screenshot}")`,
                          width: "100%",
                          height: "100%",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    )}

                    <Box sx={{ position: "absolute", p: 1, top: 0, left: 0 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!selected[i]}
                            disabled={!screenshot}
                            color="primary"
                            sx={{ ml: 1 }}
                            onChange={(_, v) => handleChange(i, v, screenshot)}
                          />
                        }
                        label={`Viewport ${i + 1}`}
                      />
                    </Box>
                    {loading && (
                      <Box
                        sx={{ position: "absolute", m: 2, top: 0, right: 0 }}
                      >
                        <CircularProgress />
                      </Box>
                    )}
                  </Box>
                </Box>
              </>
            )}
          />
        ))}
      </Stack>
    </Scroll>
  );
}
