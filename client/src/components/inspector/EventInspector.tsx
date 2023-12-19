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
  Tooltip,
  Typography as Type,
  useTheme,
} from "@mui/material";
import { getColorHex } from "components/renderer/colors";
import { pick } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { ReactNode } from "react";
import { useCss } from "react-use";
import { EventLabel } from "./EventLabel";
import { PropertyList } from "./PropertyList";

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
        sx={{ color: "error.main", transform: "scale(0.5)", pl: 0.5 }}
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

  const cls = useCss({
    "& .info-button": { opacity: 0 },
    "&:hover .info-button": {
      opacity: 1,
    },
  });

  return (
    <ListItemButton
      selected={selected}
      {...props}
      className={cls}
      sx={{
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
        primary={<EventLabel event={event} hidden={false} />}
        secondary={<PropertyList event={pick(event, "f", "g", "pId")} />}
      />
      <Tooltip
        title={
          <Box p={1}>
            <PropertyList event={event} flexDirection="column" />
          </Box>
        }
      >
        <Box className="info-button" sx={{ pl: 2, color: "text.secondary" }}>
          <DataObjectOutlined fontSize="small" />
        </Box>
      </Tooltip>
    </ListItemButton>
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
