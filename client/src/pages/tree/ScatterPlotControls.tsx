import { KeyboardArrowDownOutlined } from "@mui-symbols-material/w300";
import {
  Checkbox,
  Collapse,
  IconButton,
  Stack,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Heading, Option } from "components/layer-editor/Option";
import { entries, map, startCase } from "lodash-es";
import { useState } from "react";
import { useAcrylic, usePaper } from "theme";

const CLEAN_CHECKBOX_SX: SxProps<Theme> = {
  px: 0,
  py: 1.5,
  "&:hover": {
    backgroundColor: "transparent", // remove grey hover background
  },
  "&.Mui-focusVisible": {
    outline: "none", // remove focus ring
  },
  "& .MuiSvgIcon-root": {
    transition: "none", // remove icon hover animation
  },
};

const GROUP_BY_OPTIONS = [
  {
    id: "",
    name: "No Grouping",
    description: "Show all nodes individually",
  },
  {
    id: "type",
    name: "Type",
    description: "Group by node type/status",
  },
  {
    id: "g",
    name: "g-value",
    description: "Group by cost from start (ranges)",
  },
  {
    id: "h",
    name: "h-value",
    description: "Group by heuristic to goal (ranges)",
  },
  {
    id: "f",
    name: "f-value",
    description: "Group by total cost f=g+h (ranges)",
  },
  {
    id: "step",
    name: "Step",
    description: "Group by exploration step (ranges)",
  },
];
export function ScatterPlotControls({
  eventTypes,
  scatterplotMode,
  handleAxisChange,
  handleEventTypeChange,
  handleGroupByChange,
  formInput,
  groupByAttribute,
  eventTypeFilter,
  logAxis,
  properties,
  setLogAxis,
}: {
  eventTypes: string[];
  properties: Record<string, { type: string }>;
  scatterplotMode: boolean;
  handleAxisChange: (axis: "xMetric" | "yMetric") => (value: string) => void;
  handleEventTypeChange: (value: string) => void;
  handleGroupByChange: (value: string) => void;
  formInput: {
    xMetric: string;
    yMetric: string;
  };
  groupByAttribute: string;
  eventTypeFilter: string;
  logAxis: {
    x: boolean;
    y: boolean;
  };
  setLogAxis: (
    value: (prev: { x: boolean; y: boolean }) => { x: boolean; y: boolean },
  ) => void;
}) {
  const [open, setOpen] = useState(true);
  // Combined dropdown
  const scatterPlotAxis = [
    { id: "", name: "Off" },
    { id: "step", name: "Step", value: "step" },
    ...map(
      entries(properties).filter(
        ([, v]) => !v.type.toLowerCase().includes("text"),
      ),
      ([k, v]) => ({
        id: k,
        name: `$${k}`,
        description: v.type,
      }),
    ),
  ];
  const paper = usePaper();
  const acrylic = useAcrylic();
  return (
    <Stack
      sx={{
        p: 2,
        position: "absolute",
        bottom: 0,
        right: 0,
      }}
    >
      <Stack
        sx={{
          minWidth: 300,
          px: 2,
          py: 1,
          ...acrylic,
          ...paper(1),
        }}
      >
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>Plot Options</Typography>
          <IconButton
            edge="end"
            onClick={() => setOpen((prev) => !prev)}
            size="small"
            sx={{ ml: 1 }}
          >
            {
              <KeyboardArrowDownOutlined
                color="action"
                sx={{
                  transition: (t) => t.transitions.create("transform"),
                  transform: open ? "rotate(0deg)" : "rotate(180deg)",
                }}
              />
            }
          </IconButton>
        </Stack>
        <Collapse in={open}>
          <Stack>
            <Heading label="Axis" />
            <Option
              label="X axis"
              content={
                <FeaturePicker
                  paper
                  label={formInput.xMetric ? `$.${formInput.xMetric}` : "Auto"}
                  value={formInput.xMetric}
                  items={scatterPlotAxis}
                  onChange={handleAxisChange("xMetric")}
                  arrow
                  itemOrientation="horizontal"
                />
              }
            />
            <Option
              label="Y axis"
              content={
                <FeaturePicker
                  paper
                  label={formInput.yMetric ? `$.${formInput.yMetric}` : "Auto"}
                  value={formInput.yMetric}
                  items={scatterPlotAxis}
                  onChange={handleAxisChange("yMetric")}
                  arrow
                  itemOrientation="horizontal"
                />
              }
            />
            <Option
              label="Logarithmic X axis"
              content={
                <Checkbox
                  disabled={!scatterplotMode}
                  size="small"
                  checked={logAxis.x}
                  onChange={(e) =>
                    setLogAxis((prev) => ({ ...prev, x: e.target.checked }))
                  }
                  sx={CLEAN_CHECKBOX_SX}
                />
              }
            />
            <Option
              label="Logarithmic Y axis"
              content={
                <Checkbox
                  size="small"
                  disabled={!scatterplotMode}
                  checked={logAxis.y}
                  onChange={(e) =>
                    setLogAxis((prev) => ({ ...prev, y: e.target.checked }))
                  }
                  sx={CLEAN_CHECKBOX_SX}
                />
              }
            />
            <Heading label="Filtering" />
            <Option
              label="Event type"
              content={
                <FeaturePicker
                  paper
                  disabled={!scatterplotMode}
                  ButtonProps={{ fullWidth: true }}
                  label={
                    eventTypeFilter
                      ? `Event: ${startCase(eventTypeFilter)}`
                      : "Event type"
                  }
                  value={eventTypeFilter}
                  items={[
                    { id: "", name: "All Events" },
                    ...eventTypes.map((t) => ({
                      id: t,
                      name: startCase(t),
                    })),
                  ]}
                  onChange={handleEventTypeChange}
                  arrow
                  itemOrientation="horizontal"
                />
              }
            />
            <Heading label="Grouping" />
            <Option
              label="Group by"
              content={
                <FeaturePicker
                  paper
                  disabled={!scatterplotMode}
                  ButtonProps={{ fullWidth: true }}
                  label={
                    groupByAttribute
                      ? `Group by: ${startCase(groupByAttribute)}`
                      : "Group by"
                  }
                  value={groupByAttribute}
                  items={GROUP_BY_OPTIONS}
                  onChange={handleGroupByChange}
                  arrow
                  itemOrientation="horizontal"
                />
              }
            />
          </Stack>
        </Collapse>
      </Stack>
    </Stack>
  );
}
