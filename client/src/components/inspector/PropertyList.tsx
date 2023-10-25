import { TypographyVariant } from "@mui/material";
import { Flex, FlexProps } from "components/generic/Flex";
import { Property } from "components/generic/Property";
import { Dictionary, entries, filter, map, slice } from "lodash";

export function PropertyList({
  event,
  variant = "body2",
  max = 10,
  ...props
}: {
  event?: Dictionary<any>;
  variant?: TypographyVariant;
  max?: number;
} & FlexProps) {
  const a = filter(entries(event), ([, v]) => v !== undefined);
  return (
    <Flex {...props}>
      {map(slice(a, 0, max), ([k, v]) => (
        <Property label={k} value={v} type={{ variant }} />
      ))}
      {a.length > max && (
        <Property
          label={`${a.length - max} more`}
          type={{ sx: { pt: 1 } }}
          value=""
        />
      )}
    </Flex>
  );
}
