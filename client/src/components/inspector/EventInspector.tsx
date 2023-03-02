import {
  Box,
  Card,
  CardActionArea,
  CardProps,
  Divider,
  Typography as Type,
} from "@material-ui/core";
import { Flex } from "components/generic/Flex";
import { call } from "components/script-editor/call";
import { Event } from "protocol/Render";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { useAcrylic } from "theme";
import { EventLabel } from "./EventLabel";
import { PropertyList } from "./PropertyList";

type EventInspectorProps = {
  event?: Event;
  index?: number;
  selected?: boolean;
} & CardProps;

export function EventInspector({
  event,
  index,
  selected,
  ...props
}: EventInspectorProps) {
  const acrylic = useAcrylic();
  const [{ specimen }] = useSpecimen();
  const [{ code }, setUIState] = useUIState();

  const cardStyles = selected
    ? {
        color: "primary.contrastText",
        bgcolor: "primary.main",
      }
    : acrylic;

  const hidden = event
    ? !call(code ?? "", "shouldRender", [
        index ?? 0,
        event,
        specimen?.eventList ?? [],
      ])
    : false;

  return (
    <Card
      {...props}
      sx={{
        ...cardStyles,
        ...props.sx,
      }}
    >
      <CardActionArea
        sx={{ p: 2, height: "100%" }}
        onClick={() => setUIState({ step: index })}
      >
        <Flex alignItems="center">
          <Type>{index}</Type>
          <Divider sx={{ mx: 2 }} flexItem orientation="vertical" />
          <Box>
            <EventLabel event={event} hidden={hidden} />
            <PropertyList event={event} />
          </Box>
        </Flex>
      </CardActionArea>
    </Card>
  );
}
