import {
  Box,
  Card,
  CardActionArea,
  CardProps,
  Divider,
  Typography as Type,
} from "@material-ui/core";
import { Flex } from "components/generic/Flex";
import { Overline } from "components/generic/Overline";
import { Property } from "components/generic/Property";
import { entries, filter, map } from "lodash";
import { TraceEvent } from "protocol/Trace";
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
            <Overline>{`${event?.type ?? "unsupported"} #${
              event?.id ?? "-"
            }`}</Overline>
            <Flex>
              {map(
                filter(
                  [
                    ["f", event?.f],
                    ["g", event?.g],
                    ...entries(event?.variables),
                  ],
                  ([, v]) => v !== undefined
                ),
                ([k, v]) => (
                  <Property label={k} value={v} type={{ variant: "body2" }} />
                )
              )}
            </Flex>
          </Box>
        </Flex>
      </CardActionArea>
    </Card>
  );
}
