import { BoxProps, Button, Fade, Tooltip, ToggleButton } from "@material-ui/core";
import { SortTwoTone as StepsIcon } from "@material-ui/icons";
import { TabContext, TabPanel } from "@material-ui/lab";
import { alpha, Box } from "@material-ui/system";
import { Flex } from "components/generic/Flex";
import { PlaceholderCard } from "components/generic/PlaceholderCard";
import { Toolbar } from "components/generic/Toolbar";
import { startCase } from "lodash";
import { useState } from "react";
import { useUIState } from "slices/UIState";
import { EventListInspector } from "./EventListInspector";
import RightArrowIcon from "@material-ui/icons/ChevronRight";
import LeftArrowIcon from "@material-ui/icons/ChevronLeft";

export function InfoPanel(props: BoxProps & {show:boolean; setShow:React.Dispatch<React.SetStateAction<boolean>>}) {
  const {show, setShow} = props;
  const [{ playback }] = useUIState();
  const [tab, setTab] = useState("steps");
  return (
    <TabContext value={tab}>
      <Flex
        vertical
        sx={{
          pointerEvents: "none",
          transition: ({ transitions }) => transitions.create(["background", "right"]),
          bgcolor: ({ palette }) =>
            tab ? alpha(palette.background.default, 0.94) : "transparent",
        }}
        alignItems="center"
        {...props}
      >
        <ToggleButton
            value="show"
            selected={!show}
            sx={{
              position:"absolute",
              left: -40,
              top: '50%',
              pointerEvents: 'auto',
              zIndex: 10,
              border: 0,
            }}
            onChange={() => {
              setShow(!show);
            }}
          >
            {show?<RightArrowIcon />:<LeftArrowIcon/>}
          </ToggleButton>
        <Toolbar>
          {[
            { icon: <StepsIcon />, key: "steps" },
            { key: "info" },
            { key: "parameters" },
          ].map(({ key, icon }) => (
            <Tooltip key={key} title={startCase(key)}>
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
            content: <PlaceholderCard>No info to show.</PlaceholderCard>,
          },
          {
            key: "parameters",
            content: <PlaceholderCard>No parameters to show.</PlaceholderCard>,
          },
        ].map(({ content, key }) => (
          <TabPanel
            key={key}
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
