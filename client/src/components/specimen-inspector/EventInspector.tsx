import {
  Box,
  Card,
  CardActionArea,
  CardProps,
  Divider,
  Typography as Type,
} from "@material-ui/core";
import { Flex } from "components/generic/Flex";
import { Space } from "components/generic/Space";
import { entries, map } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { ReactNode } from "react";
import { useUIState } from "slices/UIState";

export function getHeight(event: TraceEvent) {}

type EventInspectorProps = {
  event?: TraceEvent;
  index?: number;
  selected?: boolean;
} & CardProps;

export function EventInspector({
  event,
  index,
  selected,
  ...props
}: EventInspectorProps) {
  const [, setUIState] = useUIState();

  function renderProperty(label: ReactNode, value: ReactNode) {
    return (
      <Flex width="auto" mr={3} mt={0.5} key={`${label}::${value}`}>
        <Type variant="body2" sx={{ opacity: 0.54 }}>
          {label}
        </Type>
        <Space />
        <Type variant="body2">{value}</Type>
      </Flex>
    );
  }

  const cardStyles = selected
    ? {
        color: "primary.contrastText",
        bgcolor: "primary.main",
      }
    : {};

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
            <Type
              variant="overline"
              sx={{ my: -0.75, display: "block" }}
            >{`${event?.type} #${event?.id}`}</Type>
            <Flex>
              {event?.f !== undefined && renderProperty("f", event?.f)}
              {event?.g !== undefined && renderProperty("g", event?.g)}
              {map(entries(event?.variables), ([k, v]) => renderProperty(k, v))}
            </Flex>
          </Box>
        </Flex>
      </CardActionArea>
    </Card>
  );
}
