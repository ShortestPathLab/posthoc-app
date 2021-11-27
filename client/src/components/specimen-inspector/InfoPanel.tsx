import { BoxProps, Button, Card, Fade, Tooltip } from "@material-ui/core";
import { SortTwoTone as StepsIcon } from "@material-ui/icons";
import { TabContext, TabPanel } from "@material-ui/lab";
import { Box } from "@material-ui/system";
import { Flex } from "components/generic/Flex";
import { Toolbar } from "components/generic/Toolbar";
import { startCase } from "lodash";
import { useState } from "react";
import { useUIState } from "slices/UIState";
import { EventListInspector } from "./EventListInspector";

export function InfoPanel(props: BoxProps) {
  const [{ playback }] = useUIState();
  const [tab, setTab] = useState("steps");
  return (
    <TabContext value={tab}>
      <Flex
        vertical
        sx={{ pointerEvents: "none" }}
        alignItems="center"
        {...props}
      >
        <Toolbar>
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
        </Toolbar>
        {[
          {
            key: "steps",
            content: (
              <Fade unmountOnExit mountOnEnter in={playback === "paused"}>
                <Box height="100%" width="100%" pl={1}>
                  <EventListInspector height="100%" width="100%" />
                </Box>
              </Fade>
            ),
          },
          {
            key: "info",
            content: <Card sx={{ m: 2, p: 2 }}>-</Card>,
          },
          {
            key: "parameters",
            content: <Card sx={{ m: 2, p: 2 }}>-</Card>,
          },
        ].map(({ content, key }) => (
          <TabPanel
            value={key}
            sx={{ pointerEvents: "all", flex: 1, p: 0, width: "100%" }}
          >
            {content}
          </TabPanel>
        ))}
      </Flex>
    </TabContext>
  );
}
