import {
  ListItemButton,
  ListItemButtonProps,
  ListItemIcon,
  ListItemText,
  Typography as Type,
  useTheme,
} from "@mui/material";
import { getColorHex } from "components/renderer/colors";
import { TraceEvent } from "protocol/Trace";
import { useUIState } from "slices/UIState";
import { useAcrylic } from "theme";
import { EventLabel } from "./EventLabel";
import { PropertyList } from "./PropertyList";
import { usePlayback } from "slices/playback";

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
  const [, setPlayback] = usePlayback();

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
      }}
      onClick={() => setPlayback({ step: index })}
    >
      <ListItemIcon>
        <Type variant="body2">{index}</Type>
      </ListItemIcon>
      <ListItemText
        primary={<EventLabel event={event} hidden={false} />}
        secondary={<PropertyList event={event} />}
      ></ListItemText>
    </ListItemButton>
  );
}
