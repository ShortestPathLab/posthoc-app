import { Box, Divider, useTheme } from "@mui/material";
import { WhenIdle } from "components/generic/LazyList";
import { EventInspector, Skeleton } from "components/inspector/EventInspector";
import { pxToInt, PADDING_TOP, ITEM_HEIGHT } from "./constants";
import { useItemPlaybackState } from "./useItemPlaybackState";
import { useItemState } from "./useItemState";

export function Item({
  layer,
  index = 0,
  event: eventIndex = 0,
  disabled,
}: {
  index?: number;
  disabled?: boolean;
  layer?: string;
  event?: number;
}) {
  const { spacing } = useTheme();

  const { stepTo, playing } = useItemPlaybackState(layer);
  const { event, isSelected, label } = useItemState({
    layer,
    index: eventIndex,
  });
  return (
    <Box
      sx={{
        height: pxToInt(spacing(index ? 0 : 6 + PADDING_TOP)) + ITEM_HEIGHT,
        pt: index ? 0 : spacing(6 + PADDING_TOP),
      }}
    >
      <WhenIdle>
        {playing ? (
          <Skeleton event={event} />
        ) : (
          <EventInspector
            sx={{
              opacity: disabled ? 0.25 : 1,
            }}
            event={event}
            index={eventIndex}
            selected={isSelected}
            label={label}
            onClick={() => stepTo(eventIndex)}
          />
        )}
      </WhenIdle>
      <Divider variant="inset" />
    </Box>
  );
}
