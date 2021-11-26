import {
  BoxProps,
  Button,
  Card,
  Fade,
  Stack,
  Tooltip,
} from "@material-ui/core";
import { SortTwoTone as StepsIcon } from "@material-ui/icons";
import { TabContext, TabPanel } from "@material-ui/lab";
import { Box } from "@material-ui/system";
import { Flex } from "components/generic/Flex";
import { startCase } from "lodash";
import { useState } from "react";
import { useUIState } from "slices/UIState";
import { glass } from "theme";
import { EventListInspector } from "./EventListInspector";

export function InfoPanel(props: BoxProps) {
  const [{ playback }] = useUIState();
  const [tab, setTab] = useState("steps");
  return (
    <TabContext value={tab}>
      <Flex vertical {...props}>
        <Flex justifyContent="center" height="auto">
          <Card sx={{ m: 3, px: 1, py: 1.25, ...glass }}>
            <Stack spacing={2} direction="row">
              {[
                { icon: <StepsIcon />, key: "steps" },
                { key: "info" },
                { key: "parameters" },
              ].map(({ key, icon }) => (
                <Tooltip title={startCase(key)}>
                  <Button
                    onClick={() => setTab(key === tab ? "" : key)}
                    color="primary"
                    variant={key === tab ? "contained" : "text"}
                    startIcon={icon}
                  >
                    {startCase(key)}
                  </Button>
                </Tooltip>
              ))}
            </Stack>
          </Card>
        </Flex>
        <TabPanel value="info" sx={{ flex: 1, p: 0, textAlign: "center" }}>
          No content.
        </TabPanel>
        <TabPanel
          value="parameters"
          sx={{ flex: 1, p: 0, textAlign: "center" }}
        >
          No content.
        </TabPanel>
        <TabPanel value="steps" sx={{ flex: 1, py: 0, px: 1 }}>
          <Fade unmountOnExit mountOnEnter in={playback === "paused"}>
            <Box height="100%" width="100%">
              <EventListInspector height="100%" width="100%" />
            </Box>
          </Fade>
        </TabPanel>
      </Flex>
    </TabContext>
  );
}
