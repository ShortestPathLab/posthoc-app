import {
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
  const { spacing } = useTheme();

  // const cardStyles = selected
  //   ? {
  //       color: "primary.contrastText",
  //       bgcolor: "primary.main",
  //     }
  //   : acrylic;

  // const hidden = event
  //   ? !call(code ?? "", "shouldRender", [
  //       index ?? 0,
  //       event,
  //       specimen?.eventList ?? [],
  //     ])
  //   : false;

  return (
    <ListItemButton
      selected={selected}
      {...props}
      sx={{
        borderLeft: `${spacing(0.5)} solid ${getColorHex(event?.type)}`,
        ...props.sx,
      }}
    >
      <ListItemIcon>
        <Type variant="body2">{index}</Type>
      </ListItemIcon>
      <Tooltip title={<PropertyList event={event} flexDirection="column" />}>
        <ListItemText
          sx={{ overflow: "hidden" }}
          primary={<EventLabel event={event} hidden={false} />}
          secondary={<PropertyList event={pick(event, "f", "g", "pId")} />}
        />
      </Tooltip>
    </ListItemButton>
  );
}

export function Skeleton() {
  const { spacing } = useTheme();
  return (
    <>
      <ListItem
        sx={{
          height: 80,
          borderLeft: `${spacing(0.5)} solid transparent`,
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
