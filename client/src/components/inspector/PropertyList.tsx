import { TypographyVariant } from "@mui/material";
import { Flex, FlexProps } from "components/generic/Flex";
import { Property } from "components/generic/Property";
import { Dictionary, entries, filter, map } from "lodash";

export function PropertyList({
  event,
  variant = "body2",
  ...props
}: {
  event?: Dictionary<any>;
  variant?: TypographyVariant;
} & FlexProps) {
  return (
    <Flex {...props}>
      {map(
        filter(entries(event), ([, v]) => v !== undefined),
        ([k, v]) => (
          <Property label={k} value={v} type={{ variant }} />
        )
      )}
    </Flex>
  );
}
