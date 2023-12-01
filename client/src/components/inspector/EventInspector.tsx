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
import { EventLabel } from "./EventLabel";
import { PropertyList } from "./PropertyList";
import IconButton from "@mui/material/IconButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useCss } from "react-use";

type EventInspectorProps = {
  event?: TraceEvent;
  index?: number;
  selected?: boolean;
} & ListItemButtonProps;

export function EventInspector({
  event,
  index,
  selected,
  ...props
}: EventInspectorProps) {
  const { spacing, transitions } = useTheme();

  const cls = useCss({
    "& .info-button": { opacity: 0, transition: transitions.create("opacity") },
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
      <ListItemIcon>
        <Type variant="body2">{index}</Type>
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
          <InfoOutlinedIcon />
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
