import { DataObjectOutlined, FiberManualRecord } from "@mui/icons-material";
import {
  Box,
  Divider,
  ListItem,
  ListItemButton,
  ListItemButtonProps,
  ListItemIcon,
  ListItemText,
  Skeleton as Placeholder,
  Stack,
  Tooltip,
  Typography as Type,
  useTheme,
} from "@mui/material";
import { IconButtonWithTooltip as IconButton } from "components/generic/IconButtonWithTooltip";
import { getColorHex } from "components/renderer/colors";
import { omit, pick, startCase } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { ReactNode } from "react";
import { useCss } from "react-use";
import {
  ESSENTIAL_PROPS,
  OMIT_PROPS,
  PropertyDialog,
  PropertyList,
} from "./PropertyList";

type EventInspectorProps = {
  event?: TraceEvent;
  index?: number;
  selected?: boolean;
  label?: ReactNode;
} & ListItemButtonProps;

function Dot({ label }: { label?: ReactNode }) {
  return (
    <Tooltip title={label}>
      <FiberManualRecord
        sx={{ color: "error.main", transform: "scale(0.5)", pl: 0.5, mr: 2 }}
        fontSize="small"
      />
    </Tooltip>
  );
}

export function EventInspector({
  event,
  index,
  selected,
  label,
  ...props
}: EventInspectorProps) {
  const { spacing } = useTheme();

  const buttonCls = useCss({});
  const extrasCls = useCss({});

  const omitProps = omit(event, ...OMIT_PROPS);

  const essentialProps = pick(omitProps, ...ESSENTIAL_PROPS);

  const extraProps = omit(omitProps, ...ESSENTIAL_PROPS);

  return (
    <Box
      sx={{
        position: "relative",
        [`> .${extrasCls}`]: { opacity: 0 },
        [`&:hover > .${extrasCls}`]: { opacity: 1 },
        [`&:hover > .${buttonCls}`]: { pr: 8 },
      }}
    >
      <ListItemButton
        className={buttonCls}
        selected={selected}
        {...props}
        sx={{
          height: 80,
          borderLeft: `${spacing(0.5)} solid ${getColorHex(event?.type)}`,
          ...props.sx,
        }}
      >
        <ListItemIcon sx={{ alignItems: "center" }}>
          <Type variant="body2">{index}</Type>
          {label && <Dot label={label} />}
        </ListItemIcon>

        <ListItemText
          sx={{ overflow: "hidden" }}
          primary={
            <Box
              sx={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                display: "block",
                textOverflow: "ellipsis",
                my: 0.5,
              }}
            >
              {startCase(`${event?.type ?? "event"} ${event?.id ?? "-"}`)}{" "}
            </Box>
          }
          secondaryTypographyProps={{
            component: "div",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
          secondary={
            <Stack
              direction="row"
              justifyContent="flex-start"
              sx={{
                "> *": { flex: 0 },
              }}
            >
              <PropertyList event={essentialProps} simple />
              <PropertyList event={extraProps} simple />
            </Stack>
          }
        />
      </ListItemButton>
      <Stack
        className={extrasCls}
        direction="row"
        sx={{
          p: 1,
          justifyContent: "center",
          position: "absolute",
          right: 0,
          alignItems: "center",
          top: 0,
          height: "100%",
        }}
      >
        <PropertyDialog
          {...{ event }}
          trigger={(onClick) => (
            <IconButton
              {...{ onClick }}
              sx={{ p: 1.5, color: "text.secondary" }}
              label="See All Properties"
              icon={<DataObjectOutlined fontSize="small" />}
            ></IconButton>
          )}
        />
      </Stack>
    </Box>
  );
}

export function Skeleton({ event }: EventInspectorProps) {
  const { spacing } = useTheme();
  return (
    <>
      <ListItem
        sx={{
          height: 80,
          borderLeft: `${spacing(0.5)} solid ${getColorHex(event?.type)}`,
        }}
      >
        <ListItemIcon>
          <Placeholder animation={false} width={spacing(4)} />
        </ListItemIcon>
      </ListItem>
      <Divider variant="inset" />
    </>
  );
}
