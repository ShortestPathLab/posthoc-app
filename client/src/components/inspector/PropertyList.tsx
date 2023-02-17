import { TypographyVariant } from "@material-ui/core";
import { Flex, FlexProps } from "components/generic/Flex";
import { Property } from "components/generic/Property";
import { Event } from "components/render/types/render";
import { entries, filter, map } from "lodash";

export function PropertyList({
  event,
  variant = "body2",
  ...props
}: {
  event?: Event;
  variant?: TypographyVariant;
} & FlexProps) {
  return (
    <Flex flexWrap="wrap" {...props}>
      {map(
        filter(
          [
            ["f", event?.f],
            ["g", event?.g],
            ...entries(event?.variables),
            ["pId", event?.pId],
            ["info", event?.info],
          ],
          ([, v]) => v !== undefined
        ),
        ([k, v]) => (
          <Property label={k} value={v} type={{ variant }} />
        )
      )}
    </Flex>
  );
}
