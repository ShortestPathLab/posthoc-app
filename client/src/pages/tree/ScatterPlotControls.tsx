import { KeyboardArrowDownOutlined } from "@mui-symbols-material/w300";
import {
  ModeStandbyOutlined,
  TimelineOutlined,
} from "@mui-symbols-material/w400";
import {
  Checkbox,
  Collapse,
  IconButton,
  Stack,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import "@react-sigma/core/lib/style.css";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Heading, Option } from "components/layer-editor/Option";
import { entries, map, startCase } from "lodash-es";
import { useState } from "react";
import { useAcrylic, usePaper } from "theme";
import { SharedGraphProps } from "./SharedGraphProps";
import { useComputeLabels, useComputeTypes } from "./TreeUtility";
import { TreeOptions } from "./useTreeOptions";

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

export const SYMBOL_METRIC_STEP = "step";

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
    id: SYMBOL_METRIC_STEP,
    name: "Step",
    description: "Group by exploration step (ranges)",
  },
];

export const layoutModes = {
  "directed-graph": {
    value: "directed-graph",
    name: "Directed Graph",
    description: "Show all edges",
    showAllEdges: true,
  },
  tree: {
    value: "tree",
    name: "Tree",
    description: "Show only edges between each node and their final parents",
    showAllEdges: false,
  },
  plot: {
    value: "plot",
    name: "Scatter Plot",
    description: "Show scatterplot",
    showAllEdges: false,
  },
};

export function ScatterPlotControls({
  trackedProperty,
  trace,
  traceKey,
  setAxis,
  setTypeFilter,
  setGroupByAttribute,
  axis,
  groupByAttribute,
  typeFilter,
  logAxis,
  setLogAxis,
  mode,
  setMode,
  setTrackedProperty,
}: SharedGraphProps & TreeOptions) {
  const { data: properties } = useComputeLabels({
    trace: trace,
    key: traceKey,
  });

  const { data: types = [] } = useComputeTypes({
    trace: trace,
    key: traceKey,
  });
  const [open, setOpen] = useState(true);
  // Combined dropdown
  const scatterPlotAxis = [
    {
      id: SYMBOL_METRIC_STEP,
      name: "Step",
      value: SYMBOL_METRIC_STEP,
    },
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
          <Typography>Display Options</Typography>
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
        <Option
          label="Layout"
          content={
            <FeaturePicker
              paper
              icon={<ModeStandbyOutlined />}
              label="Layout"
              value={mode}
              items={map(entries(layoutModes), ([k, v]) => ({
                id: k,
                ...v,
              }))}
              onChange={(e) => setMode(e as keyof typeof layoutModes)}
              arrow
            />
          }
        />
        <Option
          label="Colouring"
          content={
            <FeaturePicker
              paper
              icon={<TimelineOutlined />}
              label="Colouring"
              value={trackedProperty}
              items={[
                { id: "", name: "Event Type" },
                ...map(entries(properties), ([k, v]) => ({
                  id: k,
                  name: `$${k}`,
                  description: v.type,
                })),
              ]}
              onChange={setTrackedProperty}
              arrow
            />
          }
        />
        <Collapse in={open}>
          <Stack>
            <Heading label="Plot Options" />
            <Option
              label="X axis"
              content={
                <FeaturePicker
                  paper
                  disabled={mode !== "plot"}
                  label={axis.xMetric ? `$.${axis.xMetric}` : "Auto"}
                  value={axis.xMetric}
                  items={scatterPlotAxis}
                  onChange={setAxis("xMetric")}
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
                  disabled={mode !== "plot"}
                  label={axis.yMetric ? `$.${axis.yMetric}` : "Auto"}
                  value={axis.yMetric}
                  items={scatterPlotAxis}
                  onChange={setAxis("yMetric")}
                  arrow
                  itemOrientation="horizontal"
                />
              }
            />
            <Option
              label="Logarithmic X axis"
              content={
                <Checkbox
                  disabled={mode !== "plot"}
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
                  disabled={mode !== "plot"}
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
                  disabled={mode !== "plot"}
                  ButtonProps={{ fullWidth: true }}
                  label={
                    typeFilter
                      ? `Event: ${startCase(typeFilter)}`
                      : "Event type"
                  }
                  value={typeFilter}
                  items={[
                    { id: "", name: "All Events" },
                    ...types.map((t) => ({
                      id: t,
                      name: startCase(t),
                    })),
                  ]}
                  onChange={setTypeFilter}
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
                  disabled={mode !== "plot"}
                  ButtonProps={{ fullWidth: true }}
                  label={
                    groupByAttribute
                      ? `Group by: ${startCase(groupByAttribute)}`
                      : "Group by"
                  }
                  value={groupByAttribute}
                  items={GROUP_BY_OPTIONS}
                  onChange={setGroupByAttribute}
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
